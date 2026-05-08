"""
Script for validating and converting `SCHEDULE` env var to AWS cron expression.

If `SCHEDULE` is invalid or is not cron-expressible, raises an Exception;
otherwise, prints cron expression for buffered schedule, ex. "45 12,20 * * ? *".
"""

import os


def get_env(name: str):
    var = os.getenv(name)
    if var is None:
        raise Exception(f"{name} env var not set")
    return var


def get_schedule() -> list[int]:
    """Parse, validate, and sort `SCHEDULE` env var.

    Returns:
        list[int]: schedule parsed as list of integers representing HHMM times,
            sorted in ascending order.
    """
    schedule = get_env("SCHEDULE")

    if not (schedule.strip().startswith("[") and schedule.strip().endswith("]")):
        raise Exception("SCHEDULE env var is not an array")

    def str_to_int(s: str) -> int:
        try:
            return int(s)
        except ValueError:
            raise Exception(f"SCHEDULE env var contains invalid time: {s}")

    schedule = [str_to_int(t.strip()) for t in (schedule.strip()[1:-1]).split(",")]

    if len(schedule) == 0:
        raise Exception("SCHEDULE env var is empty")

    for time in schedule:
        if time < 0 or time > 2359 or time % 100 > 59:
            raise Exception(f"SCHEDULE env var contains invalid time: {time}")

    return sorted(schedule)


def buffer_schedule(schedule: list[int]) -> list[int]:
    """Subtract `SCHEDULE_BUFFER` env var from each schedule time.

    Args:
        schedule (list[int]): list of integers representing HHMM times.

    Returns:
        list[int]: actual function runtime schedule, with buffer subtracted from
            each time in schedule.
    """

    def subtract_from_hhmm(hhmm: int, amount: int):
        # convert hhmm to total minutes since midnight
        hours = hhmm // 100
        minutes = hhmm % 100
        total_minutes = hours * 60 + minutes

        res_total_minutes = (total_minutes - amount) % 1440
        res_hours = res_total_minutes // 60
        res_minutes = res_total_minutes % 60
        return res_hours * 100 + res_minutes

    buffer = int(get_env("SCHEDULE_BUFFER"))
    return sorted([subtract_from_hhmm(t, buffer) for t in schedule])


def generate_aws_cron(schedule: list[int]) -> str:
    """Generate cron expression in AWS format, if possible.

    The schedule is expressible in a single cron expression if the Cartesian
    product of all unique hours and all unique minutes within the schedule
    matches the schedule itself.

    If the schedule is not cron-expressible, raises an Exception.

    Args:
        schedule (list[int]): list of integers representing HHMM times.

    Raises:
        Exception: schedule is not cron-expressible

    Returns:
        str: cron expression in AWS format (minutes, hours, day of month, month,
            day of week, year)
    """
    schedule_pairs = {(t // 100, t % 100) for t in schedule}

    unique_hours = {t // 100 for t in schedule}
    unique_minutes = {t % 100 for t in schedule}
    cartesian_product = {(h, m) for h in unique_hours for m in unique_minutes}

    if schedule_pairs != cartesian_product:
        raise Exception(f"schedule {schedule} is not cron-expressible")

    hours_field = ",".join(str(h) for h in sorted(unique_hours))
    minutes_field = ",".join(str(m) for m in sorted(unique_minutes))

    return f"{minutes_field} {hours_field} * * ? *"


def main():
    schedule = get_schedule()
    buffered_schedule = buffer_schedule(schedule)
    cron = generate_aws_cron(buffered_schedule)
    print(cron)


if __name__ == "__main__":
    main()

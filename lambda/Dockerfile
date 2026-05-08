ARG FUNCTION_DIR="/function"


# Install requirements
FROM python:3.12 AS builder

ARG FUNCTION_DIR
WORKDIR ${FUNCTION_DIR}

COPY src requirements.txt ./
RUN pip install --no-cache-dir --target . awslambdaric
RUN pip install --no-cache-dir --target . -r requirements.txt


# Production image
FROM python:3.12-slim AS runner

ARG FUNCTION_DIR
WORKDIR ${FUNCTION_DIR}

ENV NUMBA_CACHE_DIR=/tmp

COPY --from=builder ${FUNCTION_DIR} .

ENTRYPOINT [ "/usr/local/bin/python", "-m", "awslambdaric" ]
CMD ["lambda_function.lambda_handler"]

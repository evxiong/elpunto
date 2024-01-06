FROM public.ecr.aws/lambda/python:3.11
ENV NUMBA_CACHE_DIR=/tmp
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN yum -y update && yum -y install gcc
RUN pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install -r requirements.txt
RUN pip install --no-deps sentence-transformers
RUN pip install --no-deps bertopic
COPY src ${LAMBDA_TASK_ROOT}
CMD ["lambda_function.lambda_handler"]
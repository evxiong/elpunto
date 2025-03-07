ARG FUNCTION_DIR="/function"

FROM python:3.12 AS build-image
ARG FUNCTION_DIR
RUN mkdir -p ${FUNCTION_DIR}
COPY src ${FUNCTION_DIR}

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --target ${FUNCTION_DIR} awslambdaric
RUN pip install --no-cache-dir --target ${FUNCTION_DIR} -r requirements.txt
RUN pip install --no-cache-dir --target ${FUNCTION_DIR} \
    torch==2.6.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir --target ${FUNCTION_DIR} \
    --no-deps sentence-transformers==3.4.1
RUN pip install --no-cache-dir --target ${FUNCTION_DIR} \
    --no-deps bertopic==0.16.4

FROM python:3.12-slim
ARG FUNCTION_DIR
WORKDIR ${FUNCTION_DIR}

ENV NUMBA_CACHE_DIR=/tmp

COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

ENTRYPOINT [ "/usr/local/bin/python", "-m", "awslambdaric" ]
CMD ["lambda_function.lambda_handler"]
# Deno（JavaScript実行環境）は公式イメージから実行ファイルだけを取り込む（amd64 / arm64 の両対応）
FROM denoland/deno:bin AS deno

FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    DATA_DIR=/data DENO_DIR=/data/ytdlp/deno-cache DENO_NO_UPDATE_CHECK=1 TZ=Asia/Tokyo

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates tzdata \
 && rm -rf /var/lib/apt/lists/*

COPY --from=deno /deno /usr/local/bin/deno

WORKDIR /srv
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app

RUN useradd --uid 1000 --create-home appuser && mkdir -p /data && chown appuser /data
USER appuser
VOLUME /data
EXPOSE 8080

HEALTHCHECK --interval=60s --timeout=5s --start-period=30s \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/healthz', timeout=3).status == 200 else 1)"

# ワーカーは1つだけ（ジョブキューをプロセス内で持つため、増やさないこと）
CMD ["uvicorn", "app.main:app_factory", "--factory", "--host", "0.0.0.0", "--port", "8080", "--workers", "1", "--proxy-headers", "--forwarded-allow-ips", "*"]

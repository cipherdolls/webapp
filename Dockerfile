FROM public.ecr.aws/docker/library/node:20-alpine AS development-dependencies-env

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL

ARG VITE_STREAM_RECORDER_URL
ENV VITE_STREAM_RECORDER_URL=$VITE_STREAM_RECORDER_URL

ARG VITE_STREAM_PLAYER_URL
ENV VITE_STREAM_PLAYER_URL=$VITE_STREAM_PLAYER_URL

COPY . /app
WORKDIR /app
RUN npm ci

FROM public.ecr.aws/docker/library/node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM public.ecr.aws/docker/library/node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM public.ecr.aws/docker/library/node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]
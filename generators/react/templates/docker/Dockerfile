FROM node:14-buster as build
WORKDIR /build
COPY . .
RUN ls -ltr

FROM nginx:alpine
COPY --from=build /build/build /usr/share/nginx/html

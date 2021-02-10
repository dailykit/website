FROM mhart/alpine-node:12.18.0 as build

ARG REACT_APP_DATAHUB_URL
ARG REACT_APP_DATAHUB_ADMIN_SECRET
ARG REACT_APP_DATA_HUB_SUBSCRIPTIONS_URI


WORKDIR /usr/src/app
COPY package.json ./
RUN yarn
COPY . .

ENV PATH /app/node_modules/.bin:$PATH
ENV SKIP_PREFLIGHT_CHECK true
ENV REACT_APP_DATAHUB_URL $REACT_APP_DATAHUB_URL
ENV REACT_APP_DATAHUB_ADMIN_SECRET $REACT_APP_DATAHUB_ADMIN_SECRET
ENV REACT_APP_DATA_HUB_SUBSCRIPTIONS_URI $REACT_APP_DATA_HUB_SUBSCRIPTIONS_URI

RUN yarn build

FROM nginx:1.15.2-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

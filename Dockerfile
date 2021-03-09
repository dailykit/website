FROM mhart/alpine-node:12.18.0 as build

ARG REACT_APP_DATAHUB_URL
ARG REACT_APP_DATAHUB_ADMIN_SECRET
ARG REACT_APP_DATAHUB_SUBSCRIPTIONS_URL
ARG REACT_APP_CLIENTID
ARG REACT_APP_DAILYOS_SERVER_URL
ARG REACT_APP_CURRENCY
ARG REACT_APP_MAPS_API_KEY
ARG REACT_APP_PAYMENTS_API_URL


WORKDIR /usr/src/app
COPY package.json ./
RUN yarn
COPY . .

ENV PATH /app/node_modules/.bin:$PATH
ENV SKIP_PREFLIGHT_CHECK true
ENV REACT_APP_DATAHUB_URL $REACT_APP_DATAHUB_URL
ENV REACT_APP_DATAHUB_ADMIN_SECRET $REACT_APP_DATAHUB_ADMIN_SECRET
ENV REACT_APP_DATAHUB_SUBSCRIPTIONS_URL $REACT_APP_DATAHUB_SUBSCRIPTIONS_URL
ENV REACT_APP_CLIENTID $REACT_APP_CLIENTID
ENV REACT_APP_DAILYOS_SERVER_URL $REACT_APP_DAILYOS_SERVER_URL
ENV REACT_APP_CURRENCY $REACT_APP_CURRENCY
ENV REACT_APP_MAPS_API_KEY $REACT_APP_MAPS_API_KEY
ENV REACT_APP_PAYMENTS_API_URL $REACT_APP_PAYMENTS_API_URL

RUN yarn build

FROM nginx:1.15.2-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

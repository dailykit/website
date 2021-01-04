FROM mhart/alpine-node:12.18.0 as build

ARG REACT_APP_DATA_HUB_URI
ARG REACT_APP_DATA_HUB_SUBSCRIPTIONS_URI
ARG REACT_APP_TEMPLATE_URL
ARG REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET
ARG REACT_APP_CURRENCY
ARG REACT_APP_ROOT_FOLDER

WORKDIR /usr/src/app
COPY package.json ./
RUN yarn
COPY . .

ENV PATH /app/node_modules/.bin:$PATH
ENV SKIP_PREFLIGHT_CHECK true
ENV REACT_APP_DATA_HUB_URI $REACT_APP_DATA_HUB_URI
ENV REACT_APP_DATA_HUB_SUBSCRIPTIONS_URI $REACT_APP_DATA_HUB_SUBSCRIPTIONS_URI
ENV REACT_APP_TEMPLATE_URL $REACT_APP_TEMPLATE_URL
ENV REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET $REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET
ENV REACT_APP_CURRENCY $REACT_APP_CURRENCY
ENV REACT_APP_ROOT_FOLDER $REACT_APP_ROOT_FOLDER


RUN yarn build

FROM nginx:1.15.2-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


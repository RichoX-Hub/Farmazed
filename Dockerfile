FROM nginx:alpine

# All assets are self-contained inside farmazed-web/
COPY farmazed-web/ /usr/share/nginx/html/farmazed-web/

# Custom nginx config — redirect root to /farmazed-web/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

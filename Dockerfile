FROM nginx:alpine

# Copy site files preserving relative path structure
COPY farmazed-web/ /usr/share/nginx/html/farmazed-web/
COPY "References/Frontend Farmazed/wecare/" "/usr/share/nginx/html/References/Frontend Farmazed/wecare/"

# Custom nginx config — redirect root to /farmazed-web/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

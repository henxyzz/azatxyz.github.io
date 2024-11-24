# Gunakan image dasar
FROM ubuntu:20.04

# Set environment variable untuk menghindari interaksi selama build
ENV DEBIAN_FRONTEND=noninteractive

# Update dan install paket yang diperlukan
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    curl \
    openssh-server \
    nginx \
    sudo \
    && apt-get clean

# Setup Nginx dan SSH
RUN mkdir /var/run/sshd
RUN echo 'root:root' | chpasswd

# Konfigurasi SSH untuk membuka port 22
RUN sed -i 's/#Port 22/Port 22/' /etc/ssh/sshd_config
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Install tmate untuk SSH session sharing
RUN wget -nc https://github.com/tmate-io/tmate/releases/download/2.4.0/tmate-2.4.0-static-linux-i386.tar.xz &> /dev/null
RUN tar --skip-old-files -xvf tmate-2.4.0-static-linux-i386.tar.xz &> /dev/null

# Copy konfigurasi dan file aplikasi (jika ada)
COPY ./my-app /var/www/html

# Expose port yang diperlukan
EXPOSE 80 22

# Jalankan SSH dan Nginx secara bersamaan
CMD service ssh start && nginx -g 'daemon off;'

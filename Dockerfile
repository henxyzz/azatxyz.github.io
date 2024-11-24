# Gunakan base image Ubuntu
FROM ubuntu:20.04

# Set environment untuk instalasi non-interaktif
ENV DEBIAN_FRONTEND=noninteractive

# Update sistem dan install paket yang dibutuhkan
RUN apt-get update && apt-get install -y \
    xrdp \
    xfce4 \
    xfce4-terminal \
    dbus-x11 \
    xauth \
    xfonts-base \
    xserver-xorg-core \
    && apt-get clean

# Buat user untuk login RDP
RUN useradd -m -s /bin/bash rdpuser && \
    echo "rdpuser:password123" | chpasswd

# Konfigurasi xRDP
RUN echo "xfce4-session" > /home/rdpuser/.xsession && \
    sed -i 's/port=3389/port=3389/' /etc/xrdp/xrdp.ini && \
    sed -i 's/console/anybody/' /etc/xrdp/sesman.ini

# Set permissions agar user bisa menggunakan xRDP
RUN chown -R rdpuser:rdpuser /home/rdpuser

# Buka port 3389 untuk RDP
EXPOSE 3389

# Jalankan xRDP saat container dimulai
CMD ["/usr/sbin/xrdp", "--nodaemon"]

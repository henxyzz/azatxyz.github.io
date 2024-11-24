# Use official Ubuntu base image
FROM ubuntu:latest

# Set environment variables to non-interactive mode to avoid prompting during the installation
ENV DEBIAN_FRONTEND=noninteractive

# Set timezone
RUN ln -fs /usr/share/zoneinfo/UTC /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata

# Update and install required packages
RUN apt-get update -y && apt-get upgrade -y \
    && apt-get install -y \
    curl \
    build-essential \
    linux-headers-$(uname -r) \
    ufw \
    openssh-server \
    mysql-server \
    mysql-client \
    nginx \
    php-fpm \
    php-mysql \
    php-gd \
    php-curl \
    php-mcrypt \
    php-cli \
    php-common \
    php-pear \
    php-dev \
    php-apcu \
    php-pdo \
    php-pdo-mysql \
    php-xml \
    php-mbstring \
    sudo \
    nano \
    && apt-get clean

# Secure SSH
RUN echo "PermitRootLogin no" >> /etc/ssh/sshd_config \
    && echo "PasswordAuthentication no" >> /etc/ssh/sshd_config \
    && echo "PubkeyAuthentication yes" >> /etc/ssh/sshd_config \
    && echo "AllowGroups sshusers" >> /etc/ssh/sshd_config

# Create a non-root user and add to sshusers group
RUN groupadd -r sshusers \
    && useradd -m -G sshusers -s /bin/bash latuser \
    && echo "latuser:password" | chpasswd

# Set SSH permissions and generate SSH keys for user
RUN mkdir -p /home/latuser/.ssh \
    && ssh-keygen -t rsa -b 2048 -f /home/latuser/.ssh/id_rsa -N "" \
    && chown -R latuser:latuser /home/latuser/.ssh \
    && chmod 700 /home/latuser/.ssh \
    && chmod 600 /home/latuser/.ssh/id_rsa \
    && chmod 644 /home/latuser/.ssh/id_rsa.pub

# Configure UFW firewall
RUN ufw allow 22 \
    && ufw allow 80 \
    && ufw enable

# MySQL secure installation (set root password and remove insecure defaults)
RUN mysql_secure_installation

# Configure MySQL user and database for Magento
RUN service mysql start && \
    mysql -e "CREATE DATABASE magento;" && \
    mysql -e "GRANT ALL PRIVILEGES ON magento.* TO 'magento_user'@'localhost' IDENTIFIED BY 'password';" && \
    mysql -e "FLUSH PRIVILEGES;"

# Install Magento and PHP dependencies
RUN mkdir -p /var/www/devmagento \
    && chown -R latuser:latuser /var/www/devmagento

# Download and extract Magento (replace with correct version)
RUN curl -O https://magento.com/downloads/assets/1.9.0.1/magento-1.9.0.1.tar.gz \
    && tar xzvf magento-1.9.0.1.tar.gz -C /var/www/devmagento \
    && chown -R latuser:latuser /var/www/devmagento

# Configure Nginx
RUN echo "server {" > /etc/nginx/sites-available/magento && \
    echo "    listen 80;" >> /etc/nginx/sites-available/magento && \
    echo "    server_name YOURDOMAIN;" >> /etc/nginx/sites-available/magento && \
    echo "    root /var/www/devmagento;" >> /etc/nginx/sites-available/magento && \
    echo "    index index.php;" >> /etc/nginx/sites-available/magento && \
    echo "}" >> /etc/nginx/sites-available/magento && \
    ln -s /etc/nginx/sites-available/magento /etc/nginx/sites-enabled/

# Configure PHP-FPM
RUN sed -i "s/user = www-data/user = nginx/" /etc/php/7.4/fpm/pool.d/www.conf && \
    sed -i "s/group = www-data/group = nginx/" /etc/php/7.4/fpm/pool.d/www.conf && \
    sed -i "s/;listen.owner = www-data/listen.owner = nginx/" /etc/php/7.4/fpm/pool.d/www.conf && \
    sed -i "s/;listen.group = www-data/listen.group = nginx/" /etc/php/7.4/fpm/pool.d/www.conf

# Expose necessary ports
EXPOSE 80 22

# Start services
CMD service mysql start && service nginx start && service php7.4-fpm start && tail -f /dev/null

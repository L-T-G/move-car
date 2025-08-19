set -eux

# echo "http://dl-cdn.alpinelinux.org/alpine/latest-stable/community" >> /etc/apk/repositories

sudo sh -c 'echo "deb http://deb.debian.org/debian bookworm main" > /etc/apt/sources.list'
sudo sh -c 'echo "deb-src http://deb.debian.org/debian bookworm main" >> /etc/apt/sources.list'
sudo sh -c 'echo "deb http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list'
sudo sh -c 'echo "deb-src http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list'
sudo sh -c 'echo "deb http://deb.debian.org/debian bookworm-updates main" >> /etc/apt/sources.list'
sudo sh -c 'echo "deb-src http://deb.debian.org/debian bookworm-updates main" >> /etc/apt/sources.list'
sudo sed -i 's@http://deb.debian.org/debian@https://mirrors.hust.edu.cn/debian@g' /etc/apt/sources.list
sudo sed -i 's@http://security.debian.org/debian-security@https://mirrors.hust.edu.cn/debian-security@g' /etc/apt/sources.list
sudo apt-get update

sudo apt-get install -y \
    bash \
    vim \
    dnsutils \
    git \
    openssh-server \
    openssh-client \
    curl




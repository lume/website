sudo ln -sf /home/infamous/lume+umbrella/apps/website/systemd.service /etc/systemd/system/lume-website.service
sudo systemctl daemon-reload
sudo systemctl enable lume-website.service

sudo ln -sf /home/infamous/lume+umbrella/apps/website/systemd.service /etc/systemd/system/infamous-website.service
sudo systemctl daemon-reload
sudo systemctl enable infamous-website.service

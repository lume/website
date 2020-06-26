sudo cp -f ./systemd.service /etc/systemd/system/lume-website.service
sudo systemctl daemon-reload
sudo systemctl enable lume-website.service

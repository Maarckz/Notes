Criação de usuário RBASH
sudo useradd --badname -m -s /bin/rbash <nomedousuario>
sudo passwd <nomedousuario>
sudo chown root.  /home/logs/.profile
sudo chown root.  /home/logs/.bashrc
sudo chmod 755 /home/logs/.profile
sudo chmod 755 /home/logs/.profile

Alterar a shell padrão do usuário
sudo usermod --shell /bin/bash <nomedousuario>
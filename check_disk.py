import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('200.234.34.240', username='root', password='Propnexai@123', timeout=10)
    
    commands = [
        "du -h -d 1 /root/.pm2/logs | sort -hr | head -n 5",
        "du -h -d 1 /var/www | sort -hr | head -n 5"
    ]
    
    for cmd in commands:
        print(f"--- Running: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(stdout.read().decode())
        
finally:
    ssh.close()

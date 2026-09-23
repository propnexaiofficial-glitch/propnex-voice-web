import paramiko
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('200.234.34.240', username='root', password='Propnexai@123', timeout=10)
    
    commands = [
        "pm2 show propnexai-frontend"
    ]
    
    for cmd in commands:
        print(f"--- Running: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        err = stderr.read().decode()
        if err:
            print("STDERR:", err)
        
finally:
    ssh.close()

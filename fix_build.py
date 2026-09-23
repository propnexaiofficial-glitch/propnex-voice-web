import paramiko
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('200.234.34.240', username='root', password='Propnexai@123', timeout=10)
    
    commands = [
        "cd /root/propnex-voice-web && npm install",
        "cd /root/propnex-voice-web && npm run build > build.log 2>&1",
        "cd /root/propnex-voice-web && pm2 restart propnexai-frontend"
    ]
    
    for cmd in commands:
        print(f"--- Running: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        print(f"Exit status: {exit_status}")
        err = stderr.read().decode()
        if err:
            print("STDERR:", err)
        
finally:
    ssh.close()

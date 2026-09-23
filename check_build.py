import paramiko
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('200.234.34.240', username='root', password='Propnexai@123', timeout=10)
    
    commands = [
        "tail -n 30 /root/propnex-voice-web/build.log"
    ]
    
    for cmd in commands:
        print(f"--- Running: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        while True:
            line = stdout.readline()
            if not line:
                break
            try:
                sys.stdout.write(line)
            except UnicodeEncodeError:
                pass
            
        err = stderr.read().decode()
        if err:
            print("STDERR:", err)
        
finally:
    ssh.close()

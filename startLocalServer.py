from sys import platform
import os

if platform == "linux" or platform == "linux2":
    os.system('python3 -m http.server')
elif platform == "win32":
    os.system('py -m http.server')
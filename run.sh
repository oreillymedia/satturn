#!/bin/bash
ver=$(python -c 'import sys; print(".".join(map(str, sys.version_info[:1])))')
if [[ $ver ==  "2" ]]
then
  python -m SimpleHTTPServer 8001
else
  python -m http.server 8001
fi
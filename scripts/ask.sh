#!/usr/bin/env bash
# Ask the local assistant a question and print steps, timing and the answer: scripts/ask.sh "question"
q="$1"; out=$(mktemp); s=$(date +%s%N)
curl -s -N -m 80 -X POST localhost:3000/api/chat -H 'Content-Type: application/json' -d "$(python3 -c 'import json,sys;print(json.dumps({"message":sys.argv[1]}))' "$q")" > "$out"
echo "== $q  ($(( ($(date +%s%N)-s)/1000000 ))ms)"
python3 - "$out" <<'PY'
import json,sys
txt="";steps=[]
for l in open(sys.argv[1]):
    if not l.startswith('data: '): continue
    e=json.loads(l[6:])
    if e['type']=='delta': txt+=e['text']
    elif e['type']=='replace': txt=e['text']
    elif e['type']=='step' and e['status']!='running': steps.append(f"{e['label']} -> {e.get('detail','')}")
    elif e['type']=='card': steps.append('CARD '+e['kind']+(' '+e['id'] if e.get('id') else ''))
    elif e['type']=='done': steps.append(f"done {e.get('model','')}")
    elif e['type']=='error': steps.append('ERROR '+e['message'])
for st in steps: print('   ·',st)
print('   »',txt.strip().replace('\n',' ')[:500])
PY
rm -f "$out"

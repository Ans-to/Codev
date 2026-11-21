#!/usr/bin/env python3
"""Word-align the actual natural-speed takes using PocketSphinx and write captions.json.
Requires `pip install pocketsphinx`. The committed output makes it optional for renders.
"""
import json, re, subprocess, tempfile
from pocketsphinx import Decoder
starts=[.15,3.65,8.6,13.55,18.84,23.50]
texts=[
 'why does the world rely so heavily on the u s dollar',
 'in nineteen forty four bretton woods made it the anchor of a new monetary system',
 'even after its link to gold ended the dollar remained central to global trade',
 'deep treasury markets offer central banks a vast liquid place to hold reserves',
 'the more banks and businesses use dollars the more useful dollars become',
 'the dollar leads today but its role is not guaranteed forever']
all_lines=[]
for i,(text,offset) in enumerate(zip(texts,starts)):
    with tempfile.NamedTemporaryFile() as f:
        subprocess.run(['ffmpeg','-y','-v','error','-i',f'sound/voice-{i+1:02}.wav','-ar','16000','-ac','1','-f','s16le',f.name],check=True)
        d=Decoder(samprate=16000,loglevel='ERROR');d.set_align_text(text);d.start_utt();d.process_raw(open(f.name,'rb').read(),full_utt=True);d.end_utt()
        words=[]
        for s in d.seg():
            if s.word.startswith('<'):continue
            w=re.sub(r'\(\d+\)$','',s.word)
            words.append({'text':w,'start':round(offset+s.start_frame/100,3),'end':round(offset+(s.end_frame+1)/100,3)})
        # Merge the separately aligned letters of the U.S. initialism.
        for j in range(len(words)-1):
            if words[j]["text"] == "u" and words[j+1]["text"] == "s":
                words[j:j+2] = [{"text":"U.S.", "start":words[j]["start"], "end":words[j+1]["end"]}]
                break
        # Compact phrases, not a permanently displayed paragraph.
        chunks=[]
        for j in range(0,len(words),5):
            chunk=words[j:j+5];chunks.append({'start':chunk[0]['start'],'end':chunk[-1]['end']+.17,'words':chunk})
        all_lines.extend(chunks)
with open('captions.json','w') as f:json.dump(all_lines,f,indent=2)

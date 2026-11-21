#!/usr/bin/env python3
"""Build a deterministic, original score and sound effects, then use the kit mixer.

Narration takes are generated separately and never time-stretched. Captions are
aligned separately (see align_captions.py); everything here uses film seconds.
"""
import math, os, struct, subprocess, wave, json
os.makedirs('sound/sfx',exist_ok=True)
R=24000

def wav(path, seconds, fn):
    with wave.open(path,'wb') as f:
        f.setparams((1,2,R,int(R*seconds),'NONE','not compressed'))
        data=bytearray()
        for i in range(int(R*seconds)):
            t=i/R; x=max(-.97,min(.97,fn(t,i)));data.extend(struct.pack('<h',int(x*32767)))
        f.writeframes(data)

def noise(i):
    x=math.sin(i*127.1+311.7)*43758.5453
    return 2*(x-math.floor(x))-1
# Chords: a restrained original instrumental pulse, high enough for small speakers.
chords=[[110,138.59,164.81,220],[87.31,110,130.81,174.61],[65.41,82.41,98,130.81],[98,123.47,146.83,196]]
def music(t,i):
    fade=min(1,t/.6,(30-t)/1.4);chord=chords[int(t/2.5)%4];beat=t%.625
    pad=sum(math.sin(2*math.pi*f*t+.15*math.sin(t*.3+j)) for j,f in enumerate(chord))*.035
    pulse=math.exp(-beat*6)*math.sin(2*math.pi*chord[int(t/.625)%4]*2*t)*.045
    return (pad+pulse)*fade
wav('sound/music.wav',30,music)
# Full decays are kept; each cue is timed to a visible action.
wav('sound/sfx/coin.wav',1.2,lambda t,i:.23*math.exp(-t*7)*(math.sin(2*math.pi*1450*t)+.5*math.sin(2*math.pi*2120*t))+.02*noise(i)*math.exp(-t*25))
wav('sound/sfx/paper.wav',.8,lambda t,i:.13*noise(i)*math.exp(-t*7)*(.5+.5*math.sin(2*math.pi*12*t)))
wav('sound/sfx/chime.wav',1.1,lambda t,i:.12*math.exp(-t*6)*(math.sin(2*math.pi*1046*t)+.45*math.sin(2*math.pi*1568*t)))
wav('sound/sfx/click.wav',.35,lambda t,i:.18*noise(i)*math.exp(-t*45)+.07*math.sin(2*math.pi*900*t)*math.exp(-t*14))
wav('sound/sfx/whoosh.wav',.8,lambda t,i:.06*noise(i)*math.sin(math.pi*t/.8)**2)
# Assemble original takes into a 30-second voice track, using silence between takes.
starts=[.15,3.65,8.6,13.55,18.84,23.50]
inputs=[]; filters=[];streams=[]
for i,at in enumerate(starts):
    inputs.extend(['-i',f'sound/voice-{i+1:02}.wav']);streams.append(f'[v{i}]')
    filters.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={round(at*1000)}:all=1,apad,atrim=0:30[v{i}]')
filters.append(''.join(streams)+f'amix=inputs={len(streams)}:normalize=0:duration=longest,atrim=0:30[v]')
subprocess.run(['ffmpeg','-y','-v','error',*inputs,'-filter_complex',';'.join(filters),'-map','[v]','-c:a','pcm_s16le','sound/voice.wav'],check=True)
sfx=[('coin.wav',.18,'coin lands'),('paper.wav',3.72,'agreement enters'),('coin.wav',5.2,'gold bar settles'),('chime.wav',8.9,'trade route one'),('chime.wav',9.35,'trade route two'),('chime.wav',9.8,'trade route three'),('paper.wav',13.8,'treasury papers settle'),('click.wav',14.4,'screen switches to market'),('click.wav',15.1,'chart activates'),('chime.wav',19.2,'first network marker'),('chime.wav',19.65,'second network marker'),('chime.wav',20.1,'third network marker'),('whoosh.wav',23.55,'closing camera move')]
cfg={'length':30,'target_lufs':-14,'voice':{'file':'sound/voice.wav','at':0,'gain_db':0},'music':{'file':'sound/music.wav','gain_db':-7,'duck':True,'fade_out':1.2},'sfx':[{'file':'sound/sfx/'+p,'at':at,'gain_db':-11,'why':why} for p,at,why in sfx]}
with open('sound/cues.json','w') as f:json.dump(cfg,f,indent=2)
subprocess.run(['python3','mix.py','sound/cues.json','sound/mix.wav'],check=True)

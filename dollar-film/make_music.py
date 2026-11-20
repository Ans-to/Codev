"""Original 30-second instrumental bed, synthesized without external samples."""
import math, wave, struct, os
R=24000; T=30; twopi=2*math.pi
# Slow, warm four-chord progression, 96 bpm.
chords=[[110,138.59,164.81,220],[87.31,110,130.81,174.61],[65.41,82.41,98,130.81],[98,123.47,146.83,196]]
os.makedirs('sound',exist_ok=True)
with wave.open('sound/mix.wav','w') as f:
 f.setparams((2,2,R,T*R,'NONE','not compressed'))
 buf=bytearray()
 for i in range(T*R):
  t=i/R; fade=min(1,t/1.2,(T-t)/1.2); chord=chords[int(t/2.5)%4]; beat=t%0.625
  pad=sum(math.sin(twopi*freq*t+0.15*math.sin(t*.3+j)) for j,freq in enumerate(chord))*.025
  pulse=math.exp(-beat*6)*math.sin(twopi*chord[int(t/.625)%4]*2*t)*.043
  kick=math.exp(-beat*18)*math.sin(twopi*(72*t-18*beat*beat))*.09
  # Thin air on each beat, deterministic and phone-audible.
  air=(math.sin(twopi*2100*t)*math.sin(twopi*1733*t))*math.exp(-beat*38)*.015
  chime=0
  for cue in (0,5,10,15,20,25):
   d=t-cue
   if 0<=d<1.0: chime+=math.exp(-d*5)*(math.sin(twopi*880*d)+.5*math.sin(twopi*1320*d))*.035
  val=max(-1,min(1,(pad+pulse+kick+air+chime)*fade)); x=int(val*32767);buf.extend(struct.pack('<hh',x,x))
  if len(buf)>=65536:f.writeframesraw(buf);buf.clear()
 if buf:f.writeframesraw(buf)

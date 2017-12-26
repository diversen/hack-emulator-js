// Adds 1 + ... + 100
@i
M=1 // i=1
@sum
M=0 // sum=0
(LOOP)
@i
D=M // D=i
@100
D=D-A // D=i-100
@END
D;JGT // if (i-100)>0 goto END
@i
D=M // D=i
@sum
M=D+M // sum=sum+i
@i
M=M+1 // i=i+1
@LOOP
0;JMP // goto LOOP
(END)
@END
0;JMP // infinite loop
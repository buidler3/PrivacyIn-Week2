pragma circom 2.0.0;

template MultiMux1(n) {
    signal input c[n][2];  // Constants
    signal input s;   // Selector
    signal output out[n];

    for (var i=0; i<n; i++) {

        out[i] <== (c[i][1] - c[i][0])*s + c[i][0];

    }
}

template Mux1() {
    var i;
    signal input c[2];  // Constants
    signal input s;   // Selector
    signal output out;

    component mux = MultiMux1(1);

    for (i=0; i<2; i++) {
        mux.c[0][i] <== c[i];
    }

    s ==> mux.s;

    mux.out[0] ==> out;
}

template Function () {  

   // Declaration of signals.  
   signal input x;  
   signal input y;
   signal input z;
   signal output f;  

   component mul = Mux1();

   // Constraints.
   mul.c[0] <== y * z;
   mul.c[1] <== 2 * y - z;
   mul.s <-- x == 1 ? 0 : 1;

   f <== mul.out;
}

component main = Function();
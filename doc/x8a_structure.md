# Structure of X8A File (Only about LIVESET data)

## DLST
```
0x04 byte : "DLST"
0x08 byte : NumOfBanks
/*
    When there is/are 1 Bank : <Buffer 00 01 1f 75 00 00 00 00>
                                         + 0x1f 71
                      2 Bank : <Buffer 00 02 3e e6 00 00 00 00>
                                         + 0x1f 71
                      3 Bank : <Buffer 00 03 5e 57 00 00 00 00>
                                         + 0x1f 71
                      4 Bank : <Buffer 00 04 7d c8 00 00 00 00>
*/

Bank x 8 {
    0x04 byte : "Data"
    0x08 byte : ?, Always <Buffer 00 01 1f 69 00 01 1f>
    0x15 byte : Bank Name

    Page x 16 {
        0x15 byte : Page Name

        Slot x 16 {
            // each slot data size : 0x11e byte
            0x15 byte  : Comment
            0x06 byte  : Bank / Program Number / Type / etc... : 
            0x103 byte : Blank Data
        } 
    }
}
```

## ELST
```
0x04 byte : "ELST" : 
0x04 byte : ?
0x04 byte : Num of banks?
/*
    When there is/are 1 Bank : <Buffer 00 00 00 38 00 00 00 01>
                                              0x34
                      2 Bank : <Buffer 00 00 00 6c 00 00 00 02>
                                              0x34
                      3 Bank : <Buffer 00 00 00 a0 00 00 00 03>
                                              0x26
                      4 Bank : <Buffer 00 00 00 c6 00 00 00 04>
*/

Bank x 8 {
    0x04 byte : "Entr" : 
    0x1a byte : ?
    var  size : name
    0x02 byte : 0, 0
}
```
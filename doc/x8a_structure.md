# Structure of X8A File (Only about LIVESET data)

## DLST
```
0x04 byte : "DLST"
0x04 byte : Size ("Num of banks" - end of this section)
0x04 byte : Num of banks

Bank x 8 {
    0x04 byte : "Data"
    0x04 byte : Size from here to end of section : Always <Buffer 00 01 1f 69>

    0x04 byte : Size from here to end of section : Always <Buffer 00 01 1f 65>
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
0x04 byte : Size ("Num of banks" - end of this section)
0x04 byte : Num of banks

Bank x 8 { // size = 42 + name
    0x04 byte : "Entr"
    0x04 byte : Size from here to the end of this section
    
    0x04 byte : <Buffer 00 01 1f 69>
    0x02 byte : bankIndex
    0x02 byte : size? 0x0c + 0x1F71 * bankIndex
    0x02 byte : <Buffer 00 01>
    0x02 byte : bankIndex
    0x08 byte : blank
    0x02 byte : ?

    var  size : name
    0x02 byte : 0, 0
}
```
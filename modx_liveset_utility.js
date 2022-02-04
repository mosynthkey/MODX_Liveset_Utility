// YAMAHA MODX Liveset Utility
// Copyright © 2021 Masaki Ono. All rights reserved.

'use strict';

const fs = require("fs");

/*
    Structure

    "DLST"       : 0x04 byte
    Num Of Banks : 0x08 byte

    = {
        1 Bank のとき <Buffer 00 01 1f 75 00 00 00 00>
                              + 0x1f 71
        2 Bank のとき <Buffer 00 02 3e e6 00 00 00 00>
                              + 0x1f 71
        3 Bank のとき <Buffer 00 03 5e 57 00 00 00 00>
                              + 0x1f 71
        4 Bank のとき <Buffer 00 04 7d c8 00 00 00 00>

    }


    Bank x 8 {
        "Data"      : 0x04 byte
        ?           : 0x08 byte // <Buffer 00 01 1f 69 00 01 1f> いつも
        Bank Name   : 0x15 byte

        Page x 16 {
            Page Name   : 0x15 byte
            Slot x 16 {
                // Slot Data 0x11E
                Comment : 0x15 byte
                Bank / Program Number / Type / etc... : 0x06 byte
                Blank Data : 0x103 byte
            } 
        }
    }
*/

/*
    "ELST" : 0x04 byte
    ?      : 0x08 byte
    = {
        1 Bank のとき <Buffer 00 00 00 38 00 00 00 01>
                                   0x34
        2 Bank のとき <Buffer 00 00 00 6c 00 00 00 02>
                                   0x34
        3 Bank のとき <Buffer 00 00 00 a0 00 00 00 03>
                                   0x26
        4 Bank のとき <Buffer 00 00 00 c6 00 00 00 04>

        前 四桁 : address (+ 0xa5で実アドレス)
    }
    {
        "Entr" : 0x04 byte
        ?      : 0x1a byte
        Name   : var
        0, 0   : 0x02 byte
    }

*/

function createValidStringFromNullTerminatedBuffer(buffer) {
    return buffer.subarray(0, buffer.indexOf(0)).toString();
}

function printLivesetContents(fileName) {
    try {
        const fd = fs.openSync(fileName, "r");
        let textDecorder = new TextDecoder();

        // Search DLST from header
        const header_buffer = Buffer.alloc(0x110); 
        fs.readSync(fd, header_buffer, 0, 0x110, 0);
        let dlst_addr_index = header_buffer.indexOf(Buffer.from('DLST'));
        if (dlst_addr_index < 0) throw('DLST not found');
        dlst_addr_index += 0x04;

        const dlst_addr_buffer = Buffer.alloc(4);
        fs.readSync(fd, dlst_addr_buffer, 0, 4, dlst_addr_index);
        const dlst_addr = dlst_addr_buffer.readInt32BE();

        const NUM_BANK = 8;
        const NUM_PAGE = 16;
        const NUM_SLOT = 16;
        const SIZE_SLOT = 0x11E;

        {
            // debug
            const headerBuffer = Buffer.alloc(0x0c);
            fs.readSync(fd, headerBuffer, 0, 0x0b, dlst_addr);
            console.log(headerBuffer.subarray(4, 4 + 8));
        }

        let readIndex = dlst_addr + 4 /* DLST */ + 8 /* ? */;
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            
            {
                // debug
                const bankHeaderBuffer = Buffer.alloc(0x0c);
                fs.readSync(fd, bankHeaderBuffer, 0, 0x0c, readIndex);

                console.log(bankHeaderBuffer.subarray(4, 4 + 8));
            }
            // Skip "Data" + ?
            readIndex += 4 /* Data */ + 8 /* ? */;
            //console.log("Addr = 0x" + readIndex.toString(16));
            const bankNameBuffer = Buffer.alloc(0x15);
            fs.readSync(fd, bankNameBuffer, 0, 0x15, readIndex);
            //console.log("Bank " + bankIndex + ": " + createValidStringFromNullTerminatedBuffer(bankNameBuffer));
            readIndex += 0x15;

            for (let pageIndex = 0; pageIndex < NUM_PAGE; ++pageIndex) {
                // Get page name
                const pageNameBuffer = Buffer.alloc(0x15);
                fs.readSync(fd, pageNameBuffer, 0, 0x15, readIndex);
                // console.log("  Page " + pageIndex + ": " + createValidStringFromNullTerminatedBuffer(pageNameBuffer));
                readIndex += 0x15;
                
                for (let slotIndex = 0; slotIndex < NUM_SLOT; ++slotIndex) {
                    const slotBuffer = Buffer.alloc(SIZE_SLOT);
                    fs.readSync(fd, slotBuffer, 0, SIZE_SLOT, readIndex);
                    readIndex += SIZE_SLOT;

                    const slotCommentBuffer = slotBuffer.subarray(0, 0x15);
                    //console.log("    Slot " + slotIndex + ": " + createValidStringFromNullTerminatedBuffer(slotCommentBuffer));
                }
            }
        }

        let elst_addr_index = header_buffer.indexOf(Buffer.from('ELST'));
        if (elst_addr_index < 0) throw('ELST not found');
        elst_addr_index += 0x04;

        const elst_addr_buffer = Buffer.alloc(4);
        fs.readSync(fd, elst_addr_buffer, 0, 4, elst_addr_index);
        const elst_addr = elst_addr_buffer.readInt32BE();

        console.log("---");
        const hoge_buffer = Buffer.alloc(0x08);
        fs.readSync(fd, hoge_buffer, 0, 8, elst_addr + 0x04);
        console.log(hoge_buffer);
        console.log(hoge_buffer.subarray(0,4).readInt32BE());
        console.log(hoge_buffer.subarray(4,8).readInt32BE());

        readIndex = elst_addr + 0x0c;
        for (let bankIndex = 0; bankIndex < NUM_BANK; ++bankIndex) {
            console.log("0x" + readIndex.toString(16));
            readIndex += 0x04; // Skip "ELST"

            const fuga_buffer = Buffer.alloc(0x1a);
            fs.readSync(fd, fuga_buffer, 0, 0x1a, readIndex);
            readIndex += 0x1a;
            console.log(fuga_buffer);
            {
                for (let i = 0; i < 6; ++i) {
                    let buffer = fuga_buffer.subarray(i * 4, (i + 1) * 4);
                    //console.log(buffer);
                    //console.log(buffer.readInt32BE());
                }
            }
            //console.log("-");

            const bank_name_buffer = Buffer.alloc(0x15);
            for (let nameIndex = 0; ; ++nameIndex) {
                fs.readSync(fd, bank_name_buffer, nameIndex, 1, readIndex + nameIndex);
                if (bank_name_buffer[nameIndex] == 0) {
                    readIndex += (nameIndex + 2);
                    break;
                }
            }
            //console.log("    Bank " + bankIndex + ": " + createValidStringFromNullTerminatedBuffer(bank_name_buffer));
        }        
    } catch (e) {
        console.log(e);
    }
};

printLivesetContents("data/1 BANK.X8A");
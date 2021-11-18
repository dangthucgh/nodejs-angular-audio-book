# nodejs-angular-audio-book

changeNumberToLetter(e: any) {
    console.log('gg')
    let number = +e.target.value;
    let letter = '';
    let temp;
    let templet = ''

    do {
      switch (true) {
        case number > this.arrayNumber[4]:
          templet = letter + this.honTy(number);
          letter = templet
         temp = number % this.arrayNumber[4];
          number = temp;
          break;
        case number > this.arrayNumber[3]:
          templet = letter + this.honTrieu(number);
          letter = templet
          temp = number % this.arrayNumber[3];
          number = temp
          break;
        case number > this.arrayNumber[2]:
          templet = letter + this.honTram(number);
          letter = templet
          temp = number % this.arrayNumber[2];
          number = temp;
          break;

        case number > this.arrayNumber[1]:
          templet = letter + this.honTram(number);
          letter = templet
          temp = number % this.arrayNumber[1];
          number = temp;
          break;
        case number > this.arrayNumber[0]:
          templet = letter + this.honChuc(number);
          letter = templet
          temp = number % this.arrayNumber[0];
          number = temp
          break;
        default:
          templet = letter + this.donvi(number);
          letter = templet
      }
    } while (number == 0);

    this.letter = (letter.charAt(0).toUpperCase() + letter.slice(1)).substring(0, letter.length - 1) + '.';
  }

  honTy(e: any): any {
    let number = e / Math.floor(this.arrayNumber[4]);
    let letter = '';

    if (number > this.arrayNumber[3]) {
      letter = letter + this.honTrieu(number);
    }

    return letter + this.arrayHang[6];
  }

  honTrieu(e: any): string {
    let number = e / Math.floor(this.arrayNumber[3]);
    let letter = '';
    if (number > this.arrayNumber[2]) {
      letter = letter + this.honNghin(number);
    }
    return letter + this.arrayHang[5];
  }

  honNghin(e: any) {
    let number = e / Math.floor(this.arrayNumber[2]);
    let letter = '';
    if (number > this.arrayNumber[1]) {
      letter = letter + this.honTram(number);
    }
    return letter + this.arrayHang[4];
  }

  honTram(e: any) {
    let number = Math.floor(e / this.arrayNumber[1]);
    console.log('thương', number)
    let numberSur = e % this.arrayNumber[1];
    console.log('số dư', numberSur)
    let letter = this.arrayLetter[number] + this.arrayHang[2];
      letter = letter + this.honChuc(numberSur);
    return letter;
  }

  honChuc(e: any): string {
    let number = Math.floor(e / this.arrayNumber[0]);
    let numberSur = e % this.arrayNumber[0];
    let a ='';
    if(number === 1) {
      a = this.arrayHang[0];
    } else {
      a = this.arrayLetter[number] + this.arrayHang[1];
    }
    let b = '';
    if(numberSur === 5) {
      b = 'lăm '
    } else {
      b = this.donvi(numberSur);
    }
    if(number !== 1 && numberSur === 1) {
      b = 'mốt '
    }
    let letter = a + b;
    // if (number > this.arrayNumber[0]) {
    //   letter =
    //       this.arrayLetter[number] + this.arrayHang[1] + this.donvi(numberSur);
    // }
    return  letter;
  }

  donvi(e: any): string {
    let number = e;
    let letter = this.arrayLetter[number];
    return letter;
  }

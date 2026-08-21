
//X: 0   1   2   3   4
//Y:
//0   [ '░', '░', 'O', '░', '░' ]
//1   [ '░', '*', '░', '░', '░' ]  <-- startX = 1, startY = 1 (จุดเกิดผู้เล่น)
//2   [ '░', '░', '░', '^', '░' ]  <-- hatX = 3, hatY = 2 (จุดเกิดหมวก)
//3   [ 'O', '░', '░', '░', '░' ]
//4   [ '░', '░', 'O', '░', '░' ]

//prompt-sync เพื่อใช้รับ Input จากผู้เล่นผ่าน Terminal สั่ง {sigint: true} เพื่อให้ผู้เล่นสามารถกด Ctrl + C ยกเลิกการทำงานของเกมได้ทุกเมื่อ
const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field, startX = 0, startY = 0) {
    this.field = field;  //this.field  two-dimensional array appear[['*', '░', 'O'], ['░', '^', '░']] บันทึกข้อมูลกระดานเกมไว้ใน this.field
    //ตั้งค่าพิกัดเริ่มต้นของผู้เล่น (locationX, locationY) ให้ตรงกับจุดเกิดที่สุ่มได้
    this.locationX = startX;
    this.locationY = startY;
  }

  print() {
    const formattedField = this.field.map(row => row.join('')).join('\n');
    console.log(formattedField);
  }
  //Method การเคลื่อนที่
  //ตอนเข้าถึงตำแหน่งใน Array 2 มิติ ต้องใช้ this.field[แถว][คอลัมน์] ซึ่งก็คือ this.field[this.locationY][this.locationX]
  moveRight() {
    this.locationX += 1;
    //this.field[this.locationY][this.locationX] = pathCharacter;
  }
  moveLeft() {
    this.locationX -= 1;
  }
  moveDown() {
    this.locationY += 1; //ขยับลงข้างล่าง — ใน Array แถวที่เพิ่มขึ้นคือการลงล่าง
  }
  moveUp() {
    this.locationY -= 1;
  }

  static generateField(height, width, percentage = 0.2) {
    // 1. สร้างแผนที่ว่างที่มีแต่ '░'
    const field = new Array(height).fill(0).map(() => new Array(width).fill(fieldCharacter)); //สร้าง Array ขนาด height บรรจุ Array ย่อยขนาด width เติมเต็มพื้นที่ด้วย ░

    // 2. วนลูปตรวจกระเบื้องทุกช่อง สุ่มเลขสลาก Math.random() หากได้ค่าน้อยกว่า percentage (0.2) ช่องนั้นจะกลายเป็นหลุม O
    for (let y = 0; y < height; y++)  { //แถว
      for (let x = 0; x < width; x++) { //หลัก
        const prob = Math.random(); //สุ่มสลากได้ตัวเลขตั้งแต่ 0.0 ถึง 0.999...
        if (prob < percentage) { //ถ้าสุ่มได้เลข น้อยกว่า 0.2(percentage) จะถูกขุดเป็นหลุม
          field[y][x] = hole;
        }
      }
    }

    // 3. สุ่มจุดเกิดของผู้เล่น (actor) พิกัดแกน X และ Y สำหรับจุดเกิดผู้เล่น แล้ววางสัญลักษณ์ *
    const startX = Math.floor(Math.random() * width);
    const startY = Math.floor(Math.random() * height);
    field[startY][startX] = pathCharacter;

    // 4. สุ่มตำแหน่งหมวก '^'
    let hatX = Math.floor(Math.random() * width); //ความกว้าง ในแกนX
    let hatY = Math.floor(Math.random() * height); //ความสูง ในแกนY

    //โดยต้องไม่ทับจุดเกิดผู้เล่น (startX, startY) หากสุ่มทับตำแหน่งเกิดของผู้เล่น ให้ทำการสุ่มใหม่จนกว่าจะได้ตำแหน่งอื่น 
    while (hatX === startX && hatY === startY) {
      hatX = Math.floor(Math.random() * width);
      hatY = Math.floor(Math.random() * height);
    }
    field[hatY][hatX] = hat;
    //แล้วคืนค่าอ็อบเจกต์ที่มี field, startX, และ startY กลับไป
    return { field, startX, startY };
  }
  // เช็กว่าผู้เล่นเดินทะลุขอบบน ขอบล่าง ขอบซ้าย หรือขอบขวาของแผนที่หรือไม่
  isOutOfBounds() {
    return (
      this.locationY < 0 ||
      this.locationY >= this.field.length ||
      this.locationX < 0 ||
      this.locationX >= this.field[0].length
    );
  }

  // ตรวจว่าตกหลุมหรือไม่ พิกัดปัจจุบันตรงกับสัญลักษณ์หลุม O
  isHole() {
    return this.field[this.locationY][this.locationX] === hole;
  }

  // ตรวจว่าเจอหมวกหรือไม่ พิกัดปัจจุบันตรงกับสัญลักษณ์หมวก ^
  isHat() {
    return this.field[this.locationY][this.locationX] === hat;
  }

  // สั่งวาดแผนที่ และรับคำสั่งทิศทางจากผู้เล่น โดยแปลงข้อความให้เป็นอักษรตัวพิมพ์เล็ก
  play() {
    let playing = true;
    while (playing) {
      this.print();
      const direction = prompt('Which way? (w = Up, s = Down, a = Left, d = Right): ').toLowerCase();
  //-------------------------------------------------------------------------------------------------
      if (direction === 'd') this.moveRight();
      else if (direction === 'a') this.moveLeft();
      else if (direction === 's') this.moveDown();
      else if (direction === 'w') this.moveUp();
      else { //ตรวจสอบปุ่มที่พิมพ์ หากพิมพ์ผิดทิศทาง ให้แจ้งเตือนและใช้ continue เพื่อเริ่มรอบใหม่ทันทีโดยไม่เปลี่ยนพิกัด
        console.log('Enter w, s, a, or d.');
        continue;
      }

      if (this.isOutOfBounds()) {
        console.log('🚫 You went out of bounds! Game over.');
        playing = false;
      } else if (this.isHole()) {
        console.log('💀 You fell into a hole! Game over.');
        playing = false;
      } else if (this.isHat()) {
        console.log('🎉 You found the hat! You win!');
        playing = false;
      } else {
        this.field[this.locationY][this.locationX] = pathCharacter;
      }
    }
  }
} // <--- ปิด Class Field ตรงนี้
// ---- ส่วนสั่งรันเกม (อยู่นอก Class) ----
const setup = Field.generateField(5, 5, 0.2); //เรียกใช้ generateField สร้างข้อมูลแผนที่ขนาด 5x5 จากนั้นส่งค่าเข้า new Field()
const myGame = new Field(setup.field, setup.startX, setup.startY);
//และเริ่มสั่งรันเกมด้วยเมธอด .play()
myGame.play();
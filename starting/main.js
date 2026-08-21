const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field) {
    this.field = field;  //this.field  two-dimensional array appear[['*', '░', 'O'], ['░', '^', '░']]
    this.locationX = 0;
    this.locationY = 0;
  }

  print() {
    const formattedField = this.field.map(row => row.join('')).join('\n');
    console.log(formattedField);
  }
  //ตอนเข้าถึงตำแหน่งใน Array 2 มิติ ต้องใช้ this.field[แถว][คอลัมน์] ซึ่งก็คือ this.field[this.locationY][this.locationX]
  moveRight() {
    this.locationX += 1;
    this.field[this.locationY][this.locationX] = pathCharacter;
  }

  moveLeft() {
    this.locationX -= 1;
    this.field[this.locationY][this.locationX] = pathCharacter;
  }

  moveDown() {
    this.locationY += 1;
    this.field[this.locationY][this.locationX] = pathCharacter;
  }

  moveUp() {
    this.locationY -= 1;
    this.field[this.locationY][this.locationX] = pathCharacter;
  }
  static generateField(height, width, percentage = 0.2) {
    // 1. สร้างแผนที่ว่างที่มีแต่ '░'
    const field = new Array(height).fill(0).map(() => new Array(width).fill(fieldCharacter));

    // 2. วนลูปสุ่มใส่หลุม 'O' ตาม percentage
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const prob = Math.random();
        if (prob < percentage) {
          field[y][x] = hole;
        }
      }
    }

    // 3. ป้องกัน Edge Case: บังคับให้จุดเริ่มต้นผู้เล่นเป็น '*' เสมอ
    field[0][0] = pathCharacter;

    // 4. ป้องกัน Edge Case: สุ่มตำแหน่งหมวก '^' จนกว่าจะไม่ทับจุด (0, 0)
    let hatX = Math.floor(Math.random() * width);
    let hatY = Math.floor(Math.random() * height);

    while (hatX === 0 && hatY === 0) {
      hatX = Math.floor(Math.random() * width);
      hatY = Math.floor(Math.random() * height);
    }
    
    field[hatY][hatX] = hat;

    return field;
  }
}
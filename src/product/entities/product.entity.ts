import { Base } from 'entity/base.entity';
import { User } from 'entity/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'products' })
export class Product extends Base {
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  brand: string;
  @Column()
  price: number;
  @Column()
  isEmpty: boolean;
  @Column({ default: '' })
  userId: string;

  @ManyToOne(() => User, (user) => user.product)
  user: User;
}

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CategoryEntity } from '../../dictionaries/entities/category.entity';

export class Categories1759839923921 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const categoriesRepository = dataSource.getRepository(CategoryEntity);
    await categoriesRepository.save([
      {
        name: 'Development',
        subcategories: [
          {
            name: 'Web Development',
            topics: [
              {
                name: 'JavaScript',
              },
              {
                name: 'React JS',
              },
              {
                name: 'Angular',
              },
              {
                name: 'Node.js',
              },
              {
                name: 'Next.js',
              },
              {
                name: 'ASP.NET Core',
              },
              {
                name: 'Typescript',
              },
              {
                name: 'CSS',
              },
            ],
          },
          {
            name: 'Mobile Development',
            topics: [
              { name: 'Google Flutter' },
              { name: 'React Native' },
              { name: 'Kotlin' },
              { name: 'Swift' },
            ],
          },
          {
            name: 'Game Development',
            topics: [{ name: 'Unreal Engine' }, { name: 'Unity' }],
          },
        ],
      },
      {
        name: 'Business',
        subcategories: [
          {
            name: 'Communication',
            topics: [
              { name: 'Communication skills' },
              { name: 'Public speaking' },
              { name: 'Writing' },
              { name: 'ChatGPT' },
            ],
          },
          {
            name: 'Management',
            topics: [{ name: 'Product Management' }, { name: 'Leadership' }],
          },
          {
            name: 'Sales',
            topics: [
              { name: 'B2B Sales' },
              { name: 'Customer Service' },
              { name: 'LinkedIn' },
            ],
          },
          {
            name: 'Industry',
            topics: [{ name: 'Travel Business' }, { name: 'Aviation' }],
          },
        ],
      },
      {
        name: 'Lifestyle',
        subcategories: [
          {
            name: 'Arts & Crafts',
            topics: [
              { name: 'Watercolor Painting' },
              { name: 'Oil Painting' },
              { name: 'Pencil Drawing' },
            ],
          },
          {
            name: 'Food & Beverage',
            topics: [
              { name: 'Cooking' },
              { name: 'Coffee' },
              { name: 'Baking' },
              { name: 'Cocktails' },
            ],
          },
          {
            name: 'Home improvement & Gardening',
            topics: [
              { name: 'Woodworking and Carpentry' },
              { name: 'Electricity' },
              { name: 'Home Repair' },
              { name: 'Gardening' },
              { name: 'Farming' },
            ],
          },
          {
            name: 'Pet Care & Training',
            topics: [
              { name: 'Dog Training' },
              { name: 'Dog Care' },
              { name: 'Horsemanship' },
              { name: 'Animal Nutrition' },
              { name: 'Veterinary Medicine' },
            ],
          },
          {
            name: 'Beauty & Makeup',
            topics: [
              { name: 'Beauty' },
              { name: 'Skincare' },
              { name: 'Perfume' },
              { name: 'Hair Styling' },
              { name: 'Cosmetics' },
            ],
          },
        ],
      },
      {
        name: 'IT & Software',
        subcategories: [
          {
            name: 'Network & Security',
            topics: [
              { name: 'Cybersecurity' },
              { name: 'Kubernetes' },
              { name: 'IT Auditing' },
            ],
          },
          {
            name: 'Hardware',
            topics: [{ name: 'Arduino' }, { name: 'Microcontroller' }],
          },
          {
            name: 'Operating Systems & Servers',
            topics: [
              { name: 'Linux' },
              { name: 'Windows Server' },
              { name: 'System Administration' },
              { name: 'PowerShell' },
            ],
          },
        ],
      },
      {
        name: 'Photography & Video',
        subcategories: [
          {
            name: 'Photography',
            topics: [
              { name: 'Digital Photography' },
              { name: 'Mobile Photography' },
              { name: 'Street Photography' },
              { name: 'Image Editing' },
              { name: 'Food Photography' },
            ],
          },
        ],
      },
      {
        name: 'Health & Fitness',
        subcategories: [
          {
            name: 'Fitness',
            topics: [
              { name: 'Pilates' },
              { name: 'Home Workout' },
              { name: 'Muscle Building' },
            ],
          },
          {
            name: 'Sports',
            topics: [
              { name: 'Swimming' },
              { name: 'Soccer' },
              { name: 'Tennis' },
              { name: 'Running' },
              { name: 'Golf' },
            ],
          },
          {
            name: 'Nutrition & Diet',
            topics: [
              { name: 'Nutrition' },
              { name: 'Weight Loss' },
              { name: 'Healthcare' },
            ],
          },
          {
            name: 'Yoga',
            topics: [
              { name: 'Breathing Techniques' },
              { name: 'Chair Yoga' },
              { name: 'Face Yoga' },
            ],
          },
        ],
      },
      {
        name: 'Music',
        subcategories: [
          {
            name: 'Instruments',
            topics: [
              { name: 'Guitar' },
              { name: 'Piano' },
              { name: 'Drums' },
              { name: 'Violin' },
            ],
          },
          {
            name: 'Vocal',
            topics: [
              {
                name: 'Singing',
              },
              {
                name: 'Voice Training',
              },
              {
                name: 'Voice Acting',
              },
            ],
          },
          {
            name: 'Music Software',
            topics: [
              { name: 'FL Studio' },
              { name: 'Logic Pro' },
              { name: 'DJ' },
              { name: 'Ableton Live' },
            ],
          },
        ],
      },
      {
        name: 'Teaching & Academics',
        subcategories: [
          {
            name: 'Language Learning',
            topics: [
              { name: 'English Language' },
              { name: 'German Language' },
              { name: 'Spanish Language' },
              { name: 'French Language' },
              { name: 'Japanese Language' },
              { name: 'Mandarin Chinese Language' },
            ],
          },
          {
            name: 'Math',
            topics: [
              { name: 'Statistics' },
              { name: 'Algebra' },
              { name: 'Trigonometry' },
            ],
          },
          {
            name: 'Science',
            topics: [
              { name: 'Physics' },
              { name: 'Chemistry' },
              { name: 'Anatomy' },
              { name: 'Biology' },
            ],
          },
        ],
      },
      {
        name: 'Design',
        subcategories: [
          { name: 'Web Design', topics: [{ name: 'Figma' }] },
          {
            name: 'Fashion Design',
            topics: [{ name: 'Jewelery Design' }, { name: 'Textiles' }],
          },
        ],
      },
    ]);
  }
}

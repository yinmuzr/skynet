import { isFailed, getNodeById } from '@/utils/util';


describe('#isFailed', () => {
  it('should return true when status is failed', () => {
    expect(isFailed('FAILED')).toBe(true);
  });

  it('should return false when status is not failed', () => {
    expect(isFailed('LOADING')).toBe(false);
  });
});

describe('#getNodeById', () => {
  it('should return the empty object when tree is empty', () => {
    expect(getNodeById({}, 1)).toEqual({});
  });

  it('should return the correct node when the id is in the tree', () => {
    const tree = [{
      id: 1,
      name: '1',
      children: [
        {
          id: 2,
          name: '2',
          children: [],
        },
        {
          id: 3,
          name: '3',
          children: [
            {
              id: 4,
              name: '4',
              children: [],
            },
          ],
        },
      ],
    }];
    const expectedNode = {
      id: 4,
      name: '4',
      children: [],
    };
    expect(getNodeById(tree, 4)).toEqual(expectedNode);
  });
});

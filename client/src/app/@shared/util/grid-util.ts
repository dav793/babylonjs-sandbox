import { Vector2 } from '@babylonjs/core';

import { CardinalDirection } from './engine-util';

export class GridUtil {

    static getIndexByDirection(originIndex: Vector2, direction: CardinalDirection, gridSize: Vector2): Vector2 | null {
        switch (direction) {

            case CardinalDirection.N:
                if (originIndex.y === 0)
                    return null;
                return new Vector2(originIndex.x, originIndex.y-1);

            case CardinalDirection.NE:
                if (originIndex.y === 0)
                    return null;
                if (originIndex.x === gridSize.x-1)
                    return null;
                return new Vector2(originIndex.x+1, originIndex.y-1);

            case CardinalDirection.E:
                if (originIndex.x === gridSize.x-1)
                    return null;
                return new Vector2(originIndex.x+1, originIndex.y);

            case CardinalDirection.SE:
                if (originIndex.y === gridSize.y-1)
                    return null;
                if (originIndex.x === gridSize.x-1)
                    return null;
                return new Vector2(originIndex.x+1, originIndex.y+1);

            case CardinalDirection.S:
                if (originIndex.y === gridSize.y-1)
                    return null;
                return new Vector2(originIndex.x, originIndex.y+1);

            case CardinalDirection.SW:
                if (originIndex.y === gridSize.y-1)
                    return null;
                if (originIndex.x === 0)
                    return null;
                return new Vector2(originIndex.x-1, originIndex.y+1);

            case CardinalDirection.W:
                if (originIndex.x === 0)
                    return null;
                return new Vector2(originIndex.x-1, originIndex.y);

            case CardinalDirection.NW:
                if (originIndex.y === 0)
                    return null;
                if (originIndex.x === 0)
                    return null;
                return new Vector2(originIndex.x-1, originIndex.y-1);
        }
    }

}

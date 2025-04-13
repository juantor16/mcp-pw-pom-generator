export type BoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export interface ElementData {
    tag: string;
    text: string;
    selector: string;
    metadata?: {
        screenshotPath: string;
        metadataPath: string;
        boundingBox: BoundingBox;
    };
}

export type LocatorMetadata = {
    name: string;
    selector: string;
    boundingBox: BoundingBox;
};

export type ElementScreenshotData = {
    name: string;
    selector: string;
    boundingBox: BoundingBox;
    screenshot: Buffer;
};

export type PomGenerationResult = {
    pomString: string;
    locatorMappings: { locatorName: string; selector: string }[];
}; 
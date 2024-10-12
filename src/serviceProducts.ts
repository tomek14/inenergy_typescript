export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

export interface ServicePriceItem {
    Item: string;
    Price: number;
    Year?: ServiceYear
    RequiredItem?: ServiceType;
}

export const priceList: ServicePriceItem[] = [
        {
            Item: "BlurayPackage",
            Price: 300,
            RequiredItem: "VideoRecording",
        },
        {
            Item: "TwoDayEvent",
            Price: 400,
            RequiredItem: "Photography",
        },
        {
            Item: "TwoDayEvent",
            Price: 400,
            RequiredItem: "VideoRecording",
        },
        {
            Item: "WeddingSession",
            Price: 600,
        },
        {
            Item: "Photography",
            Price: 1700,
            Year: 2020,
        },
        {
            Item: "VideoRecording",
            Price: 1700,
            Year: 2020,
        },
        {
            Item: "Photography",
            Price: 1800,
            Year: 2021,
        },
        {
            Item: "VideoRecording",
            Price: 1800,
            Year: 2021,
        },
        {
            Item: "Photography",
            Price: 1900,
            Year: 2022,
        },
        {
            Item: "VideoRecording",
            Price: 1900,
            Year: 2022,
        },
    ];

export const discountsPriceList: ServicePriceItem[] = [
        {
            Item: "WeddingSession",
            RequiredItem: "Photography",
            Price: -300
        },
        {
            Item: "WeddingSession",
            RequiredItem: "VideoRecording",
            Price: -300
        },
        {
            Item: "Photography",
            RequiredItem: "VideoRecording",
            Price: -600,
            Year: 2020
        },
        {
            Item: "VideoRecording",
            RequiredItem: "Photography",
            Price: -600,
            Year: 2020
        },
        {
            Item: "Photography",
            RequiredItem: "VideoRecording",
            Price: -650,
            Year: 2021
        },
        {
            Item: "VideoRecording",
            RequiredItem: "Photography",
            Price: -650,
            Year: 2021
        },
        {
            Item: "Photography",
            RequiredItem: "VideoRecording",
            Price: -650,
            Year: 2022,
        },
        {
            Item: "VideoRecording",
            RequiredItem: "Photography",
            Price: -650,
            Year: 2022
        },
        {
            Item: "WeddingSession",
            RequiredItem: "Photography",
            Price: -600,
            Year: 2022
        },
    ];
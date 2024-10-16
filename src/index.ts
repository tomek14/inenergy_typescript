import { discountsPriceList, ServicePriceItem, priceList, ServiceType, ServiceYear } from "./serviceProducts";

export const updateSelectedServices = (previouslySelectedServices: ServiceType[], action: { type: "Select" | "Deselect"; service: ServiceType }) => {

    switch (action.type) {
        case "Select":
            if (previouslySelectedServices.includes(action.service)) {
                return [...previouslySelectedServices];
            }
            return handleSelect(action.service, previouslySelectedServices);

        case "Deselect":
            return handleDeselect(action.service, previouslySelectedServices);

        default:
            return [];
    }
};

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {

    const currentPriceList = mergeYearAndBasePriceLists(priceList.filter(x => x.Year === selectedYear || x.Year === undefined))
    const selectedItemsWithPrices = matchPricesWithServices(selectedServices, currentPriceList);
    const basePrice = calculatePriceInternal(selectedServices, selectedItemsWithPrices);

    const disocuntsPriceList = mergeYearAndBasePriceLists(discountsPriceList.filter(x => x.Year === selectedYear || x.Year === undefined));
    const discountsForSelectedItems = matchPricesWithServices(selectedServices, disocuntsPriceList);
    const discountPrice = calculatePriceInternal(selectedServices, discountsForSelectedItems);

    return ({ basePrice: basePrice, finalPrice: basePrice + discountPrice });
};

function handleDeselect(service: ServiceType, previouslySelectedServices: ServiceType[]): ServiceType[] {
    if (!previouslySelectedServices.some(x => x === service)) {
        return [...previouslySelectedServices];
    }

    const result = [...previouslySelectedServices];
    const servicesWithConstraints = priceList.filter(x => x.RequiredItem !== undefined);
    const relatedMainServices = servicesWithConstraints.filter(x => x.RequiredItem === service);

    if (relatedMainServices.length > 0) {
        for (const relatedMainService of relatedMainServices) {
            const subRelatedMainServices = servicesWithConstraints.filter(s =>
                s.Item === relatedMainService.Item && s.RequiredItem !== service
            );

            const shouldBeSelectedAfterDeletion = subRelatedMainServices
                .map(s => s.RequiredItem)
                .some(reqItem => result.includes(reqItem));

            if (!shouldBeSelectedAfterDeletion) {
                const index = result.indexOf(relatedMainService.Item as ServiceType);
                if (index !== -1) {
                    result.splice(index, 1);
                }
            }
        }
    }

    const serviceIndex = result.indexOf(service);
    if (serviceIndex !== -1) {
        result.splice(serviceIndex, 1);
    }

    return result;
}

function handleSelect(service: ServiceType, previouslySelectedServices: ServiceType[]): ServiceType[] {

    const result = [...previouslySelectedServices];
    const servicesWithConstraints = priceList.filter(x => x.RequiredItem !== undefined);
    const requiredServices = servicesWithConstraints.filter(x => x.Item === service).map(s => s.RequiredItem);

    if (requiredServices.length > 0) {
        const isConstraintSelected = requiredServices.some(requiredService =>
            result.includes(requiredService)
        );

        if (isConstraintSelected) {
            result.push(service);
        }

        return result;
    }

    return result.length === 0 ? [service] : result;
}

function calculatePriceInternal(selectedServices: ServiceType[], selectedItemsWithPrices: ServicePriceItem[]): number {

    const grouped = selectedItemsWithPrices.reduce<Record<string, ServicePriceItem[]>>((accumulator, currentValue) => {
        const currentItems = accumulator[currentValue.Item] || [];

        return {
            ...accumulator, [currentValue.Item]: [...currentItems, currentValue]
        };
    }, {});

    return Object.keys(grouped).reduce((acc, key) => {
        const groupedItem = grouped[key];
        const prices = groupedItem.filter(x => selectedServices.includes(x.RequiredItem) || x.RequiredItem === undefined);

        if (prices.length > 0) {
            const priceValue = prices.reduce((min, x) => x.Price < min.Price ? x : min);
            return acc + priceValue.Price;
        }

        return acc;
    }, 0);
}

function mergeYearAndBasePriceLists(discountsPriceList: ServicePriceItem[]): ServicePriceItem[] {

    const grouped = discountsPriceList.reduce<Record<string, ServicePriceItem[]>>((accumulator, currentValue) => {
        const key = `${currentValue.Item}_${currentValue.RequiredItem}`;

        return {
            ...accumulator, [key]: [...(accumulator[key] || []), currentValue]
        };
    }, {});

    return Object.keys(grouped).reduce((acc, key) => {
        const groupedItem = grouped[key];
        const basePrices = groupedItem.filter(x => x.Year === undefined).sort((a, b) => a.Price - b.Price)[0];
        const yearPrices = groupedItem.filter(x => x.Year !== undefined).sort((a, b) => a.Price - b.Price)[0];

        if (yearPrices) {
            acc.push(yearPrices);
        } else if (basePrices) {
            acc.push(basePrices);
        }

        return acc;
    }, [] as ServicePriceItem[]);
}

function matchPricesWithServices(selectedServices: ServiceType[], priceLists: ServicePriceItem[]): ServicePriceItem[] {
    const selectedItemsWithPrices: ServicePriceItem[] = [];

    selectedServices.forEach((selectedService) => {
        const priceItemForService = priceLists.filter(p => p.Item === selectedService);
        if (priceItemForService) {
            selectedItemsWithPrices.push(...priceItemForService);
        }
    });

    return selectedItemsWithPrices;
}
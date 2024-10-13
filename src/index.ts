import { discountsPriceList, ServicePriceItem, priceList, ServiceType, ServiceYear } from "./serviceProducts";

export const updateSelectedServices = (previouslySelectedServices: ServiceType[], action: { type: "Select" | "Deselect"; service: ServiceType }) => {

    switch (action.type) {
        case "Select":
            if (previouslySelectedServices.includes(action.service)) {
                return previouslySelectedServices;
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
        return previouslySelectedServices;
    }

    const servicesWithConstraints = priceList.filter(x => x.RequiredItem !== undefined);
    const relatedMainServices = servicesWithConstraints.filter(x => x.RequiredItem === service);

    if (relatedMainServices.length > 0) {
        for (const relatedMainService of relatedMainServices) {
            const subRelatedMainServices = servicesWithConstraints.filter(s =>
                s.Item === relatedMainService.Item && s.RequiredItem !== service
            );

            const shouldBeSelectedAfterDeletion = subRelatedMainServices
                .map(s => s.RequiredItem)
                .some(reqItem => previouslySelectedServices.includes(reqItem));

            if (!shouldBeSelectedAfterDeletion) {
                const index = previouslySelectedServices.indexOf(relatedMainService.Item as ServiceType);
                if (index !== -1) {
                    previouslySelectedServices.splice(index, 1);
                }
            }
        }
    }

    const serviceIndex = previouslySelectedServices.indexOf(service);
    if (serviceIndex !== -1) {
        previouslySelectedServices.splice(serviceIndex, 1);
    }

    return previouslySelectedServices;
}

function handleSelect(service: ServiceType, previouslySelectedServices: ServiceType[]): ServiceType[] {

    const servicesWithConstraints = priceList.filter(x => x.RequiredItem !== undefined);

    const requiredServices = servicesWithConstraints.filter(x => x.Item === service).map(s => s.RequiredItem);

    if (requiredServices.length > 0) {
        const isConstraintSelected = requiredServices.some(requiredService =>
            previouslySelectedServices.includes(requiredService)
        );

        if (isConstraintSelected) {
            previouslySelectedServices.push(service);
        }

        return previouslySelectedServices;
    }

    return previouslySelectedServices.length === 0 ? [service] : previouslySelectedServices;
}

function calculatePriceInternal(selectedServices: ServiceType[], selectedItemsWithPrices: ServicePriceItem[]): number {
    let result: number = 0.0;

    const grouped = selectedItemsWithPrices.reduce((acc, item) => {
        if (!acc[item.Item]) {
            acc[item.Item] = [];
        }
        acc[item.Item].push(item);
        return acc;
    }, {} as Record<string, ServicePriceItem[]>);

    for (const itemGroup of Object.values(grouped)) {
        const prices = itemGroup.filter(x => selectedServices.includes(x.RequiredItem) || x.RequiredItem === undefined);

        if (prices.length > 0) {
            // take lowest price
            const priceValue = prices.reduce((min, x) => x.Price < min.Price ? x : min);
            result += priceValue.Price;
        }
    }

    return result;
}

function mergeYearAndBasePriceLists(discountsPriceList: ServicePriceItem[]): ServicePriceItem[] {
    const result: ServicePriceItem[] = [];

    const grouped = discountsPriceList.reduce((acc, item) => {
        const key = `${item.Item}_${item.RequiredItem}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, ServicePriceItem[]>);

    for (const key in grouped) {
        const groupedItem = grouped[key];
        const basePrices = groupedItem.filter(x => x.Year === undefined).sort((a, b) => a.Price - b.Price)[0];
        const yearPrices = groupedItem.filter(x => x.Year !== undefined).sort((a, b) => a.Price - b.Price)[0];

        if (yearPrices) {
            result.push(yearPrices);
        } else if (basePrices) {
            result.push(basePrices);
        }
    }
    return result;
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
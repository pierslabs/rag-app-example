export declare class RestaurantChunkerService {
    private readonly logger;
    processRestaurantInfo(restaurantInfo: any): string[];
    processMenu(menu: any): string[];
    processSchedules(schedules: any): string[];
    processPolicies(policies: any[]): string[];
    processFAQs(faqs: any[]): string[];
    processSpecialEvents(events: any[]): string[];
    processAllData(data: any): string[];
}

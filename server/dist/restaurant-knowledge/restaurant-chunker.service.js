"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantChunkerService = void 0;
const common_1 = require("@nestjs/common");
let RestaurantChunkerService = class RestaurantChunkerService {
    logger = new common_1.Logger('RestaurantChunkerService');
    processRestaurantInfo(restaurantInfo) {
        const chunks = [];
        chunks.push(`Restaurante: ${restaurantInfo.name}. ${restaurantInfo.description}`);
        chunks.push(`Ubicación: ${restaurantInfo.address}. Contacto: ${restaurantInfo.contact.phone}, ${restaurantInfo.contact.email}`);
        chunks.push(`Capacidad del restaurante: ${restaurantInfo.capacity} personas. Chef: ${restaurantInfo.chef}`);
        if (restaurantInfo.about?.history) {
            const history = restaurantInfo.about.history;
            chunks.push(`Historia del restaurante: Fundado en ${history.founded}. ${history.anniversary}. ${history.origin_story}`);
        }
        if (restaurantInfo.about?.awards) {
            restaurantInfo.about.awards.forEach((award) => {
                chunks.push(`Premio recibido: ${award.name} en ${award.year}. ${award.description}. Categoría: ${award.category || 'General'}`);
            });
        }
        if (restaurantInfo.about?.event_catering) {
            const catering = restaurantInfo.about.event_catering;
            chunks.push(`Servicios de catering: Capacidad máxima de ${catering.max_capacity} personas. Especialidades: ${catering.specialties.join(', ')}`);
            chunks.push(`Zonas de servicio de catering: ${catering.locations.join(', ')}`);
            if (catering.featured_events) {
                catering.featured_events.forEach((event) => {
                    chunks.push(`Evento destacado: ${event.name} en ${event.year} para ${event.guests} invitados`);
                });
            }
        }
        if (restaurantInfo.about?.chef_legacy) {
            const chef = restaurantInfo.about.chef_legacy;
            chunks.push(`Chef actual: ${chef.current_chef}. Formación: ${chef.training}`);
            chunks.push(`Filosofía culinaria: ${chef.philosophy}`);
        }
        if (restaurantInfo.about?.testimonials) {
            restaurantInfo.about.testimonials.forEach((testimonial) => {
                chunks.push(`Testimonio de ${testimonial.source}: ${testimonial.quote}`);
            });
        }
        return chunks.filter((chunk) => chunk.length > 20);
    }
    processMenu(menu) {
        const chunks = [];
        menu.categories?.forEach((category) => {
            chunks.push(`Categoría del menú: ${category.name}`);
            category.items?.forEach((item) => {
                let chunk = `Plato: ${item.name}. ${item.description}. Precio: ${item.price}€`;
                if (item.allergens && item.allergens.length > 0) {
                    chunk += `. Alérgenos: ${item.allergens.join(', ')}`;
                }
                if (item.vegetarian)
                    chunk += '. Vegetariano';
                if (item.vegan)
                    chunk += '. Vegano';
                if (item.signature)
                    chunk += '. Plato estrella';
                if (item.award_winning)
                    chunk += '. Plato premiado';
                if (item.min_people)
                    chunk += `. Mínimo ${item.min_people} personas`;
                chunks.push(chunk);
            });
        });
        if (menu.wine_list) {
            menu.wine_list.forEach((wine) => {
                chunks.push(`Vino: ${wine.name}, tipo ${wine.type}, región ${wine.region}. Precio por botella: ${wine.price_per_bottle}€${wine.price_per_glass ? `, por copa: ${wine.price_per_glass}€` : ''}`);
            });
        }
        return chunks.filter((chunk) => chunk.length > 20);
    }
    processSchedules(schedules) {
        const chunks = [];
        if (schedules.weekdays) {
            if (schedules.weekdays.monday_to_thursday) {
                chunks.push(`Horarios de lunes a jueves: Comida ${schedules.weekdays.monday_to_thursday.lunch}, Cena ${schedules.weekdays.monday_to_thursday.dinner}`);
            }
            if (schedules.weekdays.friday) {
                chunks.push(`Horarios viernes: Comida ${schedules.weekdays.friday.lunch}, Cena ${schedules.weekdays.friday.dinner}`);
            }
        }
        if (schedules.weekend) {
            if (schedules.weekend.saturday) {
                chunks.push(`Horarios sábado: Comida ${schedules.weekend.saturday.lunch}, Cena ${schedules.weekend.saturday.dinner}`);
            }
            if (schedules.weekend.sunday) {
                chunks.push(`Horarios domingo: Comida ${schedules.weekend.sunday.lunch}${schedules.weekend.sunday.dinner !== 'Cerrado' ? `, Cena ${schedules.weekend.sunday.dinner}` : ', Cena cerrado'}`);
            }
        }
        if (schedules.holidays) {
            Object.entries(schedules.holidays).forEach(([holiday, times]) => {
                Object.entries(times).forEach(([date, hours]) => {
                    chunks.push(`Horario especial ${holiday} ${date}: ${hours}`);
                });
            });
        }
        return chunks;
    }
    processPolicies(policies) {
        return policies.map((policy) => `Política de ${policy.type}: ${policy.policy}`);
    }
    processFAQs(faqs) {
        return faqs.map((faq) => `Pregunta frecuente: ${faq.question} Respuesta: ${faq.answer}`);
    }
    processSpecialEvents(events) {
        return events.map((event) => `Evento especial: ${event.name}. ${event.description}. ${event.date}. Precio: ${event.price}€`);
    }
    processAllData(data) {
        const allChunks = [];
        if (data.restaurant_info) {
            allChunks.push(...this.processRestaurantInfo(data.restaurant_info));
        }
        if (data.menu) {
            allChunks.push(...this.processMenu(data.menu));
        }
        if (data.schedules) {
            allChunks.push(...this.processSchedules(data.schedules));
        }
        if (data.policies) {
            allChunks.push(...this.processPolicies(data.policies));
        }
        if (data.faqs) {
            allChunks.push(...this.processFAQs(data.faqs));
        }
        if (data.special_events) {
            allChunks.push(...this.processSpecialEvents(data.special_events));
        }
        this.logger.log(`Procesados ${allChunks.length} chunks de datos del restaurante`);
        return allChunks;
    }
};
exports.RestaurantChunkerService = RestaurantChunkerService;
exports.RestaurantChunkerService = RestaurantChunkerService = __decorate([
    (0, common_1.Injectable)()
], RestaurantChunkerService);
//# sourceMappingURL=restaurant-chunker.service.js.map
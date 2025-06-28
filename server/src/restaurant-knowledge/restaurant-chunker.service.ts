import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RestaurantChunkerService {
  private readonly logger = new Logger('RestaurantChunkerService');

  processRestaurantInfo(restaurantInfo: any): string[] {
    const chunks: string[] = [];

    // Información básica del restaurante
    chunks.push(
      `Restaurante: ${restaurantInfo.name}. ${restaurantInfo.description}`,
    );
    chunks.push(
      `Ubicación: ${restaurantInfo.address}. Contacto: ${restaurantInfo.contact.phone}, ${restaurantInfo.contact.email}`,
    );
    chunks.push(
      `Capacidad del restaurante: ${restaurantInfo.capacity} personas. Chef: ${restaurantInfo.chef}`,
    );

    // Historia del restaurante
    if (restaurantInfo.about?.history) {
      const history = restaurantInfo.about.history;
      chunks.push(
        `Historia del restaurante: Fundado en ${history.founded}. ${history.anniversary}. ${history.origin_story}`,
      );
    }

    // Premios
    if (restaurantInfo.about?.awards) {
      restaurantInfo.about.awards.forEach((award) => {
        chunks.push(
          `Premio recibido: ${award.name} en ${award.year}. ${award.description}. Categoría: ${award.category || 'General'}`,
        );
      });
    }

    // Servicios de catering
    if (restaurantInfo.about?.event_catering) {
      const catering = restaurantInfo.about.event_catering;
      chunks.push(
        `Servicios de catering: Capacidad máxima de ${catering.max_capacity} personas. Especialidades: ${catering.specialties.join(', ')}`,
      );
      chunks.push(
        `Zonas de servicio de catering: ${catering.locations.join(', ')}`,
      );

      if (catering.featured_events) {
        catering.featured_events.forEach((event) => {
          chunks.push(
            `Evento destacado: ${event.name} en ${event.year} para ${event.guests} invitados`,
          );
        });
      }
    }

    // Chef y filosofía
    if (restaurantInfo.about?.chef_legacy) {
      const chef = restaurantInfo.about.chef_legacy;
      chunks.push(
        `Chef actual: ${chef.current_chef}. Formación: ${chef.training}`,
      );
      chunks.push(`Filosofía culinaria: ${chef.philosophy}`);
    }

    // Testimonios
    if (restaurantInfo.about?.testimonials) {
      restaurantInfo.about.testimonials.forEach((testimonial) => {
        chunks.push(
          `Testimonio de ${testimonial.source}: ${testimonial.quote}`,
        );
      });
    }

    return chunks.filter((chunk) => chunk.length > 20);
  }

  processMenu(menu: any): string[] {
    const chunks: string[] = [];

    menu.categories?.forEach((category) => {
      chunks.push(`Categoría del menú: ${category.name}`);

      category.items?.forEach((item) => {
        let chunk = `Plato: ${item.name}. ${item.description}. Precio: ${item.price}€`;

        if (item.allergens && item.allergens.length > 0) {
          chunk += `. Alérgenos: ${item.allergens.join(', ')}`;
        }

        if (item.vegetarian) chunk += '. Vegetariano';
        if (item.vegan) chunk += '. Vegano';
        if (item.signature) chunk += '. Plato estrella';
        if (item.award_winning) chunk += '. Plato premiado';
        if (item.min_people) chunk += `. Mínimo ${item.min_people} personas`;

        chunks.push(chunk);
      });
    });

    // Carta de vinos
    if (menu.wine_list) {
      menu.wine_list.forEach((wine) => {
        chunks.push(
          `Vino: ${wine.name}, tipo ${wine.type}, región ${wine.region}. Precio por botella: ${wine.price_per_bottle}€${wine.price_per_glass ? `, por copa: ${wine.price_per_glass}€` : ''}`,
        );
      });
    }

    return chunks.filter((chunk) => chunk.length > 20);
  }

  processSchedules(schedules: any): string[] {
    const chunks: string[] = [];

    // Horarios entre semana
    if (schedules.weekdays) {
      if (schedules.weekdays.monday_to_thursday) {
        chunks.push(
          `Horarios de lunes a jueves: Comida ${schedules.weekdays.monday_to_thursday.lunch}, Cena ${schedules.weekdays.monday_to_thursday.dinner}`,
        );
      }
      if (schedules.weekdays.friday) {
        chunks.push(
          `Horarios viernes: Comida ${schedules.weekdays.friday.lunch}, Cena ${schedules.weekdays.friday.dinner}`,
        );
      }
    }

    // Horarios fin de semana
    if (schedules.weekend) {
      if (schedules.weekend.saturday) {
        chunks.push(
          `Horarios sábado: Comida ${schedules.weekend.saturday.lunch}, Cena ${schedules.weekend.saturday.dinner}`,
        );
      }
      if (schedules.weekend.sunday) {
        chunks.push(
          `Horarios domingo: Comida ${schedules.weekend.sunday.lunch}${schedules.weekend.sunday.dinner !== 'Cerrado' ? `, Cena ${schedules.weekend.sunday.dinner}` : ', Cena cerrado'}`,
        );
      }
    }

    // Horarios especiales
    if (schedules.holidays) {
      Object.entries(schedules.holidays).forEach(
        ([holiday, times]: [string, any]) => {
          Object.entries(times).forEach(([date, hours]) => {
            chunks.push(`Horario especial ${holiday} ${date}: ${hours}`);
          });
        },
      );
    }

    return chunks;
  }

  processPolicies(policies: any[]): string[] {
    return policies.map(
      (policy) => `Política de ${policy.type}: ${policy.policy}`,
    );
  }

  processFAQs(faqs: any[]): string[] {
    return faqs.map(
      (faq) => `Pregunta frecuente: ${faq.question} Respuesta: ${faq.answer}`,
    );
  }

  processSpecialEvents(events: any[]): string[] {
    return events.map(
      (event) =>
        `Evento especial: ${event.name}. ${event.description}. ${event.date}. Precio: ${event.price}€`,
    );
  }

  processAllData(data: any): string[] {
    const allChunks: string[] = [];

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

    this.logger.log(
      `Procesados ${allChunks.length} chunks de datos del restaurante`,
    );
    return allChunks;
  }
}

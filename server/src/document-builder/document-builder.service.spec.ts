import { DocumentBuilderService } from './document-builder.service';

describe('DocumentBuilderService', () => {
  it('should be getChunksByProp happy path', () => {
    const service = new DocumentBuilderService();

    const chunk = service.getChunksByProp('restaurant_info');

    expect(chunk).toBeDefined();
    expect(chunk).not.toBeNull();
  });

  it('should throw an Error when chunk not found', () => {
    const service = new DocumentBuilderService();

    expect(() => {
      service.getChunksByProp('not_found');
    }).toThrow('Property not found');
  });
});

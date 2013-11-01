describe('Say Hello', function() {
    var ptor = protractor.getInstance();

    beforeEach(function() {
        ptor.get('#/');
        button = ptor.findElement(protractor.By.className('btn-warning'));
        button.click();
    });

    it('says hello', function() {
        var message = ptor.findElement(protractor.By.className('btn-warning'));
        expect(message.getText()).toEqual('Zürich');
    });
});
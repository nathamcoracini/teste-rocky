/***************************************/
/*Autor: Natham Abdala Merlin Coracini */
/***************************************/

/**************************************************************************
TODO:

a) Ler o arquivo Json;
b) Corrigir nomes;
c) Corrigir preços;
d) Corrigir quantidades;
e) Exportar um arquivo JSON com o banco corrigido 

Validação

a) Imprime a lista com todos os nomes dos produtos, ordenados
primeiro por categoria em ordem alfabética e ordenados por id em ordem
crescente.

b) calcula qual é o valor total do estoque por categoria, ou seja,
a soma do valor de todos os produtos em estoque de cada categoria,
considerando a quantidade de cada produto.
**************************************************************************/

const fs = require('fs').promises

/*************************************************************/
/*Lê o arquivo JSON, transformando-o em um objeto Javascript**/
/*************************************************************/
async function lerJson(filename) {
    try {
        broken_database = await fs.readFile(filename, 'utf-8')
    }
    catch(err) {
        console.error(err)
        return null
    }

    try {
        parsed = JSON.parse(broken_database)
    }
    catch(err) {
        console.error(err)
        return null
    }
    return parsed    
}

/*******************************************************************/
/*Corrige os caracteres errados em todos os nomes do banco de dados*/
/*******************************************************************/
function corrigeNome(database) {
    stringDatabase = JSON.stringify(database)

    finalDatabase = stringDatabase.replace(/æ/g, 'a')
                                  .replace(/¢/g, 'c')
                                  .replace(/ø/g, 'o')
                                  .replace(/ß/g, 'b')
    try {
        parsed = JSON.parse(finalDatabase)
    }
    catch(err) {
        console.error(err)
        return null
    }
    return parsed
}

/************************************************************************************/
/*Corrige o valor da propriedade preços, transformando-as em inteiro caso necessário*/
/************************************************************************************/
function corrigePreco(database) {
    for (let i = 0; i < database.length; i++) {
        if (typeof database[i]['price'] == "string") {
            let toInt = parseInt(database[i]['price'])
            if (!isNaN(toInt))
                database[i]['price'] = parseInt(database[i]['price'])
        }   
    }
}

/*************************************************/
/*Corrige o campo quantity nos casos em que sumiu*/
/*************************************************/
function corrigeQtde(database) {
    for (let i = 0; i < database.length; i++) {
        if (database[i]['quantity'] == null) {
            database[i]['quantity'] = 0
        }   
    }
}

/****************************************************/
/*Exporta o banco de dados corrigido para um arquivo*/
/****************************************************/
async function exportaJson(filename, database) {
    databaseString = JSON.stringify(database, null, 2)

    try {
        await fs.writeFile(filename, databaseString)
    }
    catch(err) {
        console.error(err)
    }
    
    
}

/*******************************************************************/
/*Imprime a lista com todos os nomes dos produtos, ordenados       */
/*primeiro por categoria em ordem alfabética e ordenados por id em */ 
/*ordem crescente.                                                 */
/*******************************************************************/
function imprime(database) {

    // Copiando para não modificar o array original
    sortedArr = database.slice()
    sortedArr.sort(comparaItens)

    for (let i = 0; i < sortedArr.length; i++)
        console.log(sortedArr[i]['name'])
    
}
/********************************************************************/
/*Calcula qual é o valor total do estoque por categoria, ou seja,   */
/*a soma do valor de todos os produtos em estoque de cada categoria,*/
/*considerando a quantidade de cada produto.                        */ 
/********************************************************************/
function totalEstoque(database) {
    
    let nomeCategoria = []
    for (let i = 0, j = 0; i < database.length; i++)
        if (!nomeCategoria.includes(database[i]['category'])) {
            nomeCategoria[j] = database[i]['category']
            j++
        }
    
    // Cria um array com tamanho da qtde de categorias
    somaCategoria = Array(nomeCategoria.length)
    somaCategoria.fill(0)

    for (let i = 0; i < database.length; i++)
        somaCategoria[nomeCategoria.indexOf(database[i]['category'])] += database[i]['quantity']
    
    // Cria um novo array aninhado final com o nome da categoria e sua respectiva soma de qtdes
    let arrayFinal = [nomeCategoria, somaCategoria]

    return arrayFinal
    
}

/****************************************************/
/*Função de comparação para ordenação               */
/****************************************************/
function comparaItens(a, b) {
    if (a.category > b.category)
        return 1
    else if (a.category < b.category)
        return -1
    else {
        if (a.id > b.id)
            return 1
        else if (a.id > b.id)
            return -1
    }
}

(async () => {
    database = await lerJson('broken-database.json')
    if (database) {
        dbCorrigido = corrigeNome(database)
        if (dbCorrigido) {
            corrigePreco(dbCorrigido)
            corrigeQtde(dbCorrigido)
            exportaJson('saida.json', dbCorrigido) 
            imprime(dbCorrigido)
            somaCategoria = totalEstoque(dbCorrigido)
            
            console.log('')
            for (let j = 0; j < somaCategoria[0].length; j++) 
                console.log('Soma da categoria ' + somaCategoria[0][j] + ' = ' 
                + somaCategoria[1][j])
        }   
    }
})()
    
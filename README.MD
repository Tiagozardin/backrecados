--> REQUISIÇÃO
    -->ROTA
        -->MIDDLEWARE
        -->CONTROLLER
            -->REPOSITORY
                -->Entidades
                    -->Migrações




--> FLUXO DO CACHE

--> REQUISIÇÃO
    --> GET
        --> CONSULTA NO CACHE
            --> SE SIM RETORNA O CACHE
            --> SE NÃO  
                -->CONSULTA NO DB
                -->SALVA ESSA CONSULTA NO CACHE
                -->RETRONA PARA A RESPOSTA



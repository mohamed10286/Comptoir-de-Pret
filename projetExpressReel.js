var mysql = require('mysql');
const { Console } = require('console');
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
const ejs = require('ejs');
const dbConfig = {
    host: "23.235.197.135",
    user: "instit43_comptoirPret_adm",
    password: "__equipe22021__",
    database: "instit43_comptoirPret"
}

const app = express();
app.set('view engine', 'ejs')

////////////////////////////////////////////////////////////////////////////
/////////// On utilise express et express session pour garder les mot de passe et les utilisateurs séparé
////////////////////////////////////////////////////////////////////////////


function MysqlDate(HtmlDate) {
    HtmlDate.replace(/T/g, "")
    HtmlDate = HtmlDate + ":00"
    return HtmlDate
}


app.use(session({
    store: new FileStore({}),
    secret: 'ssshhhhh',
    saveUninitialized: false,
    resave: false
}));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
////////////////////////////////////////////////////////////////////////////
/////////// Page de Login
////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    return res.render("Login", {
        title: "Login"
    })

});
////////////////////////////////////////////////////////////////////////////
/////////// Code  Qui handle Login
////////////////////////////////////////////////////////////////////////////
app.post('/Login', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    if (req.body.Personne == "Professeur") {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            console.log("Connected");
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////// On vérifie ici si la personne est présente avec ce mot de passe dans la base de donnée
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var sql = "SELECT * FROM Professeurs WHERE NPROFESSEUR=? && PW = SHA2(?, 256) ";

            con.query(sql, [req.body.ID, req.body.motDePasse], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var identifiant = result;
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /////////// Si la personne est confirmé, on lui donne la permission de son niveau
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (identifiant[0]) {
                        sess.username = identifiant[0].NPROFESSEUR;
                        if (identifiant[0].STATUS == "Confirmé") {
                            sess.permission = 2;
                        } else {
                            sess.permission = 0;
                        }
                        console.log('Database connection closed.');
                        console.log(req.body.nom + ' data saved');
                        res.writeHead(302, { location: "/ListeEmprunt" });
                        res.end();
                    } else {
                        console.log('Database connection closed.');
                        console.log(req.body.nom + ' data saved');
                        res.writeHead(302, { location: "/" });
                        res.end();
                    }
                });
            });

        });
    }
    if (req.body.Personne == "Etudiant") {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            console.log("Connected");
            var sql = "SELECT * FROM Etudiants WHERE NAETUDIANT=? && PW = SHA2(?, 256) ";

            con.query(sql, [req.body.ID, req.body.motDePasse], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var identifiant = result;
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    if (identifiant[0]) {
                        sess.username = identifiant[0].NAETUDIANT;
                        if (identifiant[0].STATUS == "Confirmé") {
                            sess.permission = 1;
                        } else {
                            sess.permission = 0;
                        }
                        res.writeHead(302, { location: "/ListeEmprunt" });
                        res.end();
                    } else {
                        console.log('Database connection closed.');
                        console.log(req.body.nom + ' data saved');
                        res.writeHead(302, { location: "/" });
                        res.end();
                    }
                });
            });

        });
    }
    if (req.body.Personne == "Administrateur") {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;
            console.log("Connected");

            var sql = "SELECT * FROM ADMIN WHERE NADMIN=? && PW = SHA2(?, 256) ";

            con.query(sql, [req.body.ID, req.body.motDePasse], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                var identifiant = result;
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    if (identifiant[0]) {
                        sess.username = req.body.ID;
                        sess.permission = 3;
                        console.log('Database connection closed.');
                        console.log(req.body.nom + ' data saved');
                        res.writeHead(302, { location: "/ListeEmprunt" });
                        res.end();
                    } else {
                        console.log('Database connection closed.');
                        console.log(req.body.nom + ' data saved');
                        res.writeHead(302, { location: "/" });
                        res.end();
                    }
                });
            });

        });
    }

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Lien qui affiche la page d'inscription étudiant
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/inscription', (req, res) => {
    let sess = req.session;
    let con1 = mysql.createConnection(dbConfig);
    con1.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        var sql1 = "SELECT * FROM Programmes";
        con1.query(sql1, function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            let programmes = result;
            con1.end(function (err) {
                if (err) {
                    return console.log('error:' + err.message);
                }
                return res.render("InscriptionEtudiant", {
                    programmes: programmes,
                    title: "InscriptionEtudiant"
                })
            });
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code menant à la l'inscription d'un étudiant
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/stData', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        console.log("Connected");
        con.query("SET AUTOCOMMIT = OFF", function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            console.log("Autocommit off");
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////// insert les données dans la base de donnée de façon paramétrique
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var sql = "INSERT INTO Etudiants (NAETUDIANT, NOM, PRENOM, NUMTELEPHONE, STATUS, EMAIL, PW, PROGRAMID)"
                + " VALUES (?, ?, ?, ?, 'Non_Confirmé', ?, SHA2(?, 256), ?)";


            con.query(sql, [req.body.nAdmission, req.body.nom, req.body.prenom, req.body.nTelephone, req.body.email, req.body.motDePasse, req.body.programmeChoisi], function (err, result) {
                if (err) {
                    console.log(err)
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }

                function insertActivity(list, i) {


                    con.query("COMMIT", function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        ;
                        console.log('Commit done');
                        con.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                            console.log('Database connection closed.');
                            console.log(req.body.programmeAjouter + ' data saved');
                            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                            /////////// Envoye a la page d'accueil apres l'inscription
                            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                            res.writeHead(302, { location: "/" });
                            return res.end();
                            ;
                        });
                    });

                }

                insertActivity(sess.activitiesList, 0);
            });
        });
    });

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// page d'inscription de professeur
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/inscriptionprofesseur', (req, res) => {
    return res.render("InscriptionProfesseur", {
        title: "InscriptionProfesseur"
    })


});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code qui s'occuppe de l'inscription du professeur
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/professeurData', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        ;
        console.log("Connected");
        con.query("SET AUTOCOMMIT = OFF", function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            ;
            console.log("Autocommit off");
            var sql = "INSERT INTO Professeurs (NPROFESSEUR, NOM, PRENOM, STATUS, EMAIL, PW)"
                + " VALUES (?,?,?, 'Non-Confirmé' ,?, SHA2(?, 256) )";

            con.query(sql, [req.body.nEmploye, req.body.nom, req.body.prenom, req.body.email, req.body.motDePasse], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;

                function insertActivity(list, i) {


                    con.query("COMMIT", function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        ;
                        console.log('Commit done');
                        con.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                            console.log('Database connection closed.');
                            console.log(req.body.nom + ' data saved');
                            res.writeHead(302, { location: "/" });
                            res.end();

                        });
                    });

                }

                insertActivity(sess.activitiesList, 0);
            });
        });
    });
});


app.get('/ListeEmprunt', (req, res) => {
    let sess = req.session;
    if (sess.permission == null) {
        res.writeHead(302, {location: "/"});
        return res.end();
    }
    if (sess.permission === 0) {
        return res.render("NoHome", {
            title: "NoHome"
        })
    }
    if ([1, 2, 3].includes(sess.permission)) {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, {location: "/DataBaseConnectionFailed"});
                return res.end();
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////// Ici on cherche toutes les données nécessaire pour afficher les bonnes donées avec le bon
            /////////// type d'affichage. AKA, pas les ID, mais les noms ou les descriptions.
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            let sql1 = "SELECT EMPRUNTID, STUDENTID, ASKTEACHERID, Etudiants.NOM, Etudiants.PRENOM, NUMTELEPHONE, Etudiants.EMAIL,\n" +
                "       APRTEACHERID, ADMINID, CLASSNAME, DATE_FORMAT(DATEPREVUDEBUT, '%Y/%m/%d, %Hh%im') DATEPREVUDEBUT,\n" +
                "       DATE_FORMAT(DATEPREVUFIN, '%Y/%m/%d, %Hh%im') DATEPREVUFIN, DATE_FORMAT(DATEEMPRUNT, '%Y/%m/%d, %Hh%im') DATEEMPRUNT,\n" +
                "       DATE_FORMAT(DATERETOUR, '%Y/%m/%d, %Hh%im') DATERETOUR, a.NOM aNom, a.PRENOM aPrenom, p1.PRENOM asPrenom,\n" +
                "       p1.NOM asNom, p2.PRENOM apPrenom, p2.NOM apNom,\n" +
                "       CASE WHEN EMPRUNT.STATUS = 0 THEN 'Non confirmer'\n" +
                "            WHEN EMPRUNT.STATUS = 1 THEN 'Confirmer par professeur'\n" +
                "            WHEN EMPRUNT.STATUS = 2 THEN 'Confirmer par Admin'\n" +
                "            WHEN EMPRUNT.STATUS = 3 THEN 'Emprunt en cours'\n" +
                "            WHEN EMPRUNT.STATUS = 4 THEN 'Emprunt retourner'\n" +
                "            ELSE ''\n" +
                "           END AS STATUS\n" +
                "FROM EMPRUNT\n" +
                "    INNER JOIN Etudiants ON EMPRUNT.STUDENTID=NAETUDIANT\n" +
                "    LEFT JOIN ADMIN a ON ADMINID=a.NADMIN\n" +
                "    LEFT JOIN Professeurs p1 ON ASKTEACHERID = p1.NPROFESSEUR\n" +
                "    LEFT JOIN Professeurs p2 ON APRTEACHERID = p2.NPROFESSEUR\n";
            let sql2 = "SELECT * \n" +
                "FROM EQUIPEMENTS \n" +
                "    INNER JOIN EMPRUNTITEM ON EQUIPEMENTS.EQUIPMENTID = EMPRUNTITEM.ITEMID \n" +
                "    INNER JOIN TYPESDEQUIPEMENT ON TYPESDEQUIPEMENT.TYPEID = EQUIPEMENTS.TYPEID";
            if(sess.permission === 1){
                sql1 += " WHERE STUDENTID = " + sess.username;
            } else if(sess.permission === 2){
                sql1 += " WHERE ASKTEACHERID=" + sess.username
            }

            let sql1QueryFilterList = [];
            if(req.query.statuDeDemande){
                sql1QueryFilterList.push("EMPRUNT.STATUS" + req.query.statuDeDemande);
            }
            if(req.query.recherche && req.query.identifiant){
                let value = req.query.identifiant
                if(req.query.recherche.includes("LIKE")){
                    value = "'%"+ value +"%'";
                }
                sql1QueryFilterList.push(req.query.recherche + value);
            }
            if(sql1QueryFilterList.length > 0){
                if(sess.permission === 3){
                    sql1 += "WHERE ";
                }else{
                    sql1 += " AND ";
                }
                sql1 += sql1QueryFilterList.join(" AND ")
            }
            con1.query(sql1, function (err, result) {
                if (err) {
                    console.log(err)
                    res.writeHead(302, {location: "/ProblemeAvecDonne"});
                    return res.end();
                }
                let emprunts = result;
                con1.query(sql2, function (err, result) {
                    if (err) {
                        res.writeHead(302, {location: "/ProblemeAvecDonne"});
                        return res.end();
                    }
                    let equipementsEmprunt = result;
                    con1.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        let view_name;
                        switch(sess.permission) {
                            case 1:
                                view_name = "StudentHome";
                                break;
                            case 2:
                                view_name = "TeacherListeEmprunt";
                                break;
                            case 3:
                                view_name = "ListeEmprunt";
                                break;
                            default:
                                view_name = "Login"
                        }
                        return res.render(view_name, {
                            emprunts: emprunts,
                            equipementsEmprunt: equipementsEmprunt,
                            permission: sess.permission,
                            title: "Liste Emprunt",
                        });
                    });

                });

            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page qui capte les modifications aux emprunts
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/EmpruntModify', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected");
        con.query("SET AUTOCOMMIT = OFF", function (err, result) {
            if (err) throw err;
            var sql = "UPDATE EMPRUNT  SET ASKTEACHERID = ?, CLASSNAME = ?, DATEPREVUDEBUT =? , DATEPREVUFIN =?" +
                "WHERE EMPRUNTID=?";
            var sql2 = "DELETE FROM EMPRUNTITEM WHERE EMPRUNTID =?";
            con.query(sql2, [req.body.ID], function (err, result) {
                if (err) throw err;
                con.query(sql, [req.body.Professeurs, req.body.ClassName, MysqlDate(req.body.BeginDate), MysqlDate(req.body.EndDate), req.body.ID], function (err, result) {
                    if (err) throw err;
                    con.query("SELECT * FROM EQUIPEMENTS", function (err, equipements) {
                        if (err) throw err;

                        function insertActivity(list, i) {
                            if (i < list.length) {
                                if (req.body["c_" + list[i].EQUIPMENTID] > 0) {
                                    var sql = "INSERT INTO EMPRUNTITEM(EMPRUNTID  , ITEMID, QUANTITE) VALUES (?, ?, ?) ";

                                    con.query(sql, [req.body.ID, list[i].EQUIPMENTID, req.body["c_" + list[i].EQUIPMENTID]], function (err, result) {
                                        if (err) throw err;
                                        insertActivity(list, i + 1);
                                    });
                                } else {
                                    insertActivity(list, i + 1);
                                }
                            } else {
                                con.query("COMMIT", function (err, result) {
                                    if (err) throw err;
                                    console.log('Commit done');
                                    con.end(function (err) {
                                        if (err) {
                                            return console.log('error:' + err.message);
                                        }
                                        res.writeHead(302, {location: "/ListeEmprunt"});
                                        res.end();
                                    });
                                });
                            }
                        }
                        insertActivity(equipements, 0);
                    });
                });
            });
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page pour faire des changements au emprunts
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/empruntChange', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////// On reçoit ce que l'utilisateur choisi comme action et on agis en accordance. 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (req.body.changement == 'delete') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            let sql1 = "DELETE FROM EMPRUNTITEM WHERE EMPRUNTID = " + req.body.radioEmprunt + "";
            let sql2 = "DELETE FROM EMPRUNT WHERE EMPRUNTID = " + req.body.radioEmprunt + "";

            con.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                con.query(sql2, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    ;
                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        console.log('Database connection closed.');
                        console.log(req.body.nom + ' data saved');
                        res.writeHead(302, { location: "/ListeEmprunt" });
                        res.end();
                    });
                });
            });

        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////// si c'est un admin, qui confirme, avec permission 3, le changement est différent que si c'est un professeur
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (req.body.changement == 'Confirmer' && sess.permission == 3) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            console.log("Connected");

            var sql = "UPDATE EMPRUNT SET STATUS=2, ADMINID =" + sess.username + " " +
                " WHERE EMPRUNTID = " + req.body.radioEmprunt;

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    console.log('Database connection closed.');
                    console.log(req.body.nom + ' data saved');
                    res.writeHead(302, { location: "/ListeEmprunt" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Confirmer' && sess.permission == 2) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            console.log("Connected");

            var sql = "UPDATE EMPRUNT SET STATUS=1, APRTEACHERID =" + sess.username + " " +
                " WHERE EMPRUNTID = " + req.body.radioEmprunt;

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    console.log('Database connection closed.');
                    console.log(req.body.nom + ' data saved');
                    res.writeHead(302, { location: "/ListeEmprunt" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Emprunt effectuer') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;
            console.log("Connected");

            var sql = "UPDATE EMPRUNT SET STATUS=3, ADMINID =" + sess.username + ", DATEEMPRUNT = NOW()  " +
                " WHERE EMPRUNTID = " + req.body.radioEmprunt;

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    console.log('Database connection closed.');
                    console.log(req.body.nom + ' data saved');
                    res.writeHead(302, { location: "/ListeEmprunt" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Emprunt terminer') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;

            var sql = "UPDATE EMPRUNT SET STATUS=4, ADMINID =" + sess.username + ", DATERETOUR = NOW()  " +
                " WHERE EMPRUNTID = " + req.body.radioEmprunt;

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    console.log('Database connection closed.');
                    console.log(req.body.nom + ' data saved');
                    res.writeHead(302, { location: "/ListeEmprunt" });
                    res.end();
                });
            });

        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////// si on veut vraiment modifier l'emprunt, on doit envoyer la personne à une autre page.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (["Cloner", 'Modifier'].includes(req.body.changement) && [1, 2, 3].includes(sess.permission)) {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM Professeurs";
            var sql2 = "SELECT EQUIPEMENTS.EQUIPMENTID, EQUIPEMENTS.DESCRIPTION,EQUIPEMENTS.TYPEID, EQUIPEMENTS.QUANTITE, EMPRUNTITEM.QUANTITE as EMPRUNTQUANTITE FROM EQUIPEMENTS LEFT JOIN EMPRUNTITEM ON EQUIPEMENTS.EQUIPMENTID = EMPRUNTITEM.ITEMID AND EMPRUNTITEM.EMPRUNTID=" + req.body.radioEmprunt;
            if(sess.permission == 1){
                sql2 += " INNER JOIN PROGRAMMEEQUIPEMENTS ON EQUIPEMENTS.EQUIPMENTID = PROGRAMMEEQUIPEMENTS.EQUIPMENTID INNER JOIN Etudiants ON Etudiants.ProgramId = PROGRAMMEEQUIPEMENTS.PROGRAMMEID AND Etudiants.NAETUDIANT = " + sess.username;
            }
            var sql3 = "SELECT * FROM TYPESDEQUIPEMENT";
            var sql4 = "SELECT * FROM EMPRUNT WHERE EMPRUNTID=" + req.body.radioEmprunt;
            var sql5 = "SELECT * FROM EMPRUNTITEM INNER JOIN EQUIPEMENTS ON EQUIPEMENTS.EQUIPMENTID = EMPRUNTITEM.ITEMID WHERE EMPRUNTID=" + req.body.radioEmprunt;
            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let professeurs = result;
                con1.query(sql3, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    let typesEquipements = result;
                    con1.query(sql2, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        let equipements = result;
                        con1.query(sql4, function (err, result) {
                            if (err) {
                                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                                return res.end();
                            }
                            let emprunt = result;
                            con1.query(sql5, function (err, result) {
                                if (err) {
                                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                                    return res.end();
                                }
                                let empruntItems = result;
                                con1.end(function (err) {
                                    if (err) {
                                        return console.log('error:' + err.message);
                                    }
                                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    /////////// On dit quel Equipement on été choisi
                                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    empruntItems.forEach(ligne => {
                                        sess.page2 += ' equipmentChecked("' + ligne.ITEMID + '","' + ligne.QUANTITE + '");';
                                    });
                                    let typesEquipementsList = [];
                                    typesEquipements.forEach(function (typeEquipement){
                                        let equipementsList = [];
                                        equipements.forEach(function (equipement) {
                                            if(typeEquipement.TYPEID === equipement.TYPEID){
                                                equipementsList.push(equipement);
                                            }
                                        })
                                        if(equipementsList.length > 0){
                                            typesEquipementsList.push(typeEquipement);
                                        }
                                    })

                                    var fileToRead;
                                    if (sess.permission == 2) {
                                        fileToRead = 'ModifierEmpruntProfesseur'
                                    } else if(sess.permission == 3){
                                        fileToRead = "ModifierEmprunt"
                                    } else{
                                        fileToRead = "ModifierEmpruntEtudiant"
                                    }
                                    return res.render(fileToRead, {
                                        emprunt: emprunt[0],
                                        empruntItems: empruntItems,
                                        professeurs: professeurs,
                                        typesEquipements: typesEquipementsList,
                                        equipements: equipements,
                                        title: "Modifier Emprunt",
                                        action: req.body.changement
                                    })
                                });

                                // end con1.end
                            });
                        });
                    });
                });

            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page pour faire un emprunt
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/Emprunt', (req, res) => {
    let sess = req.session;
    if ([1, 2].includes(sess.permission)) {
        let con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            let professeursSql = "SELECT * FROM Professeurs";
            con1.query(professeursSql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let professeurs = result;
                let typeEquipementSql = "SELECT * FROM TYPESDEQUIPEMENT";
                con1.query(typeEquipementSql, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    let typesEquipements = result;
                    let equipementSql = "SELECT * FROM EQUIPEMENTS INNER JOIN PROGRAMMEEQUIPEMENTS ON EQUIPEMENTS.EQUIPMENTID = PROGRAMMEEQUIPEMENTS.EQUIPMENTID "
                    if(sess.permission === 1){
                        equipementSql += "INNER JOIN Etudiants ON Etudiants.ProgramId = PROGRAMMEEQUIPEMENTS.PROGRAMMEID AND Etudiants.NAETUDIANT = " + sess.username;
                    }
                    con1.query(equipementSql, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        let equipements = result;
                        con1.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                            let viewName;
                            if(sess.permission === 2){
                                viewName = "FaireEmpruntProfesseur";
                            }else{
                                viewName = "FaireEmprunt";
                            }
                            let typesEquipementsList = []
                            typesEquipements.forEach(function (typeEquipement){
                                let equipementsList = [];
                                equipements.forEach(function (equipement) {
                                    if(typeEquipement.TYPEID === equipement.TYPEID){
                                        equipementsList.push(equipement);
                                    }
                                })
                                if(equipementsList.length > 0){
                                    typesEquipementsList.push(typeEquipement);
                                }
                            })
                            return res.render(viewName, {
                                professeurs: professeurs,
                                typesEquipements: typesEquipementsList,
                                equipements: equipements,
                                title: "Faire Emprunt"
                            })
                        });
                    });
                });
            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page qui reçoit les informations sur les emprunts
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/EmpruntCom', (req, res) => {
    let sess = req.session;
    if ([1, 2].includes(sess.permission)) {
        let con = mysql.createConnection(dbConfig);
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            console.log("Connected");
            con.query("SELECT * FROM EQUIPEMENTS", function (err, equipements){
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.query("SET AUTOCOMMIT = OFF", function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    console.log("Autocommit off");
                    let sql, sql_values;
                    if(sess.permission === 1){
                        sql = "INSERT INTO EMPRUNT (STUDENTID, ASKTEACHERID, STATUS, CLASSNAME, DATEPREVUDEBUT, DATEPREVUFIN ) VALUES (?,?, 0, ?, ?, ?)";
                        sql_values = [sess.username, req.body.Professeurs, req.body.ClassName, MysqlDate(req.body.BeginDate), MysqlDate(req.body.EndDate)]
                    }else{
                        sql = "INSERT INTO EMPRUNT (STUDENTID, ASKTEACHERID, APRTEACHERID, STATUS, CLASSNAME, DATEPREVUDEBUT, DATEPREVUFIN ) VALUES (1,?, ?, 1, ?, ?, ?)";
                        sql_values = [sess.username, sess.username, req.body.ClassName, MysqlDate(req.body.BeginDate), MysqlDate(req.body.EndDate)]
                    }
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////==============
                    /////////// Si c'est un étudiant, le status de la demande est de 0 par défaut, et on utilise le username pour dire qui est l'étudiant
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////==============
                    con.query(sql, sql_values, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        function insertActivity(list, i) {
                            if (i < list.length) {
                                if (req.body["c_" + list[i].EQUIPMENTID] > 0) {
                                    var sql = "INSERT INTO EMPRUNTITEM(EMPRUNTID  , ITEMID, QUANTITE) VALUES (LAST_INSERT_ID(),?,?) ";

                                    con.query(sql, [list[i].EQUIPMENTID, req.body["c_" + list[i].EQUIPMENTID]], function (err, result) {
                                        if (err) {
                                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                                            return res.end();
                                        }
                                        insertActivity(list, i + 1);
                                    });
                                } else {
                                    insertActivity(list, i + 1);
                                }
                            } else {
                                con.query("COMMIT", function (err, result) {
                                    if (err) {
                                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                                        return res.end();
                                    }
                                    con.end(function (err) {
                                        if (err) {
                                            return console.log('error:' + err.message);
                                        }
                                        res.writeHead(302, { location: "/ListeEmprunt" });
                                        res.end();
                                    });
                                });
                            }
                        }
                        insertActivity(equipements, 0);
                    });
                });
            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Liste Equipement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/ListeEquipement', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        let con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM EQUIPEMENTS";
            var sql2 = "SELECT * FROM Programmes INNER JOIN PROGRAMMEEQUIPEMENTS ON IDPROGRAMME = PROGRAMMEID";
            var sql3 = "SELECT * FROM TYPESDEQUIPEMENT";
            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let equipements = result;
                con1.query(sql2, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }

                    let programmes = result;
                    con1.query(sql3, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        let typesEquipements = result;
                        con1.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                            /////////// On liste les équipements par catégorie en ajoutant la catégorie, et puis en
                            /////////// ajoutant chauqe équipement de la catégorie
                            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                            return res.render("ListeEquipement", {
                                equipements: equipements,
                                programmes: programmes,
                                typesEquipements: typesEquipements,
                                title: "Liste Équipement"
                            });
                        });

                        // end con1.end
                    });

                    // end con1.end

                });

            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Operation faite sur la Liste Equipement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/equipementChange', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);

    if (req.body.changement == 'delete') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////// On supprime l'équipement partout ou il est
            /////////// 
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            var sql = "DELETE FROM EMPRUNTITEM WHERE ITEMID = " + req.body.radioEquip + "";
            var sql2 = "DELETE FROM PROGRAMMEEQUIPEMENTS WHERE EQUIPMENTID = " + req.body.radioEquip + "";

            var sql3 = "DELETE FROM EQUIPEMENTS WHERE EQUIPMENTID = " + req.body.radioEquip + "";

            console.log(""+sql+" "+sql2+" "+sql3)
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err)
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                console.log(`success r1`)
                con.query(sql2, function (err, result) {
                    if (err) {
                        console.log(err)
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    console.log(`success r2`)
                    con.query(sql3, function (err, result) {
                        if (err) {
                            console.log(err)
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        console.log(`success r3`)
                        con.end(function (err) {
                            if (err) {
                                console.log(err)
                                return console.log('error:' + err.message);
                            }
                            res.writeHead(302, { location: "/ListeEquipement" });
                            res.end();
                        });
                    });
                });
            });
        });
    }

    if (req.body.changement == 'Modifier') {
        var page2 = '';
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM TYPESDEQUIPEMENT";
            var sql2 = "SELECT * FROM Programmes";
            var sql3 = "SELECT * FROM EQUIPEMENTS WHERE EQUIPMENTID =" + req.body.radioEquip
            var sql4 = "SELECT * FROM PROGRAMMEEQUIPEMENTS WHERE EQUIPMENTID =" + req.body.radioEquip
            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var typesEquip = result;
                con1.query(sql2, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    let programmes = result;
                    con1.query(sql3, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        let equipements = result;
                        con1.query(sql4, function (err, result) {
                            if (err) {
                                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                                return res.end();
                            }
                            let programmesEquip = result;

                            con1.end(function (err) {
                                if (err) {
                                    return console.log('error:' + err.message);
                                }
                                programmesEquip.forEach(ligne => {
                                    page2 += ' equipmentClass("' + ligne.PROGRAMMEID + '"); '
                                });

                                return res.render("ModifierEquipement", {
                                    programmes: programmes,
                                    typesEquip: typesEquip,
                                    equipement: equipements[0],
                                    programmesEquip: programmesEquip,
                                    title: "Modifier Équipement"
                                })
                            });

                            // end con1.end
                        });
                    });
                });
            });
        });
    }

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Operation faite sur la Liste Equipement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/modifyEquipment', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        con.query("SET AUTOCOMMIT = OFF", function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            var sql = "UPDATE EQUIPEMENTS SET DESCRIPTION=? , QUANTITE =?, TYPEID =? WHERE EQUIPMENTID=?";
            var sql2 = "DELETE FROM PROGRAMMEEQUIPEMENTS WHERE EQUIPMENTID=?";
            con.query(sql, [req.body.Description, req.body.Quantite, req.body.TypeEquipement, req.body.ID,], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.query("SELECT * FROM Programmes", function (err, programmes) {
                    if (err) {
                        res.writeHead(302, {location: "/ProblemeAvecDonne"});
                        return res.end();
                    }
                    con.query(sql2, [req.body.ID], function (err, result) {
                        if (err) {
                            res.writeHead(302, {location: "/ProblemeAvecDonne"});
                            return res.end();
                        }
                        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        /////////// Cette fonction mais l'équipement dans chaque programme dont il fait parti.
                        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                        function insertActivity(list, i) {
                            if (i < list.length) {
                                if (req.body["c_" + list[i].IDPROGRAMME]) {
                                    var sql = "INSERT INTO PROGRAMMEEQUIPEMENTS(EQUIPMENTID  , PROGRAMMEID) VALUES (?,?) ";
                                    con.query(sql, [req.body.ID, list[i].IDPROGRAMME], function (err, result) {
                                        if (err) {
                                            res.writeHead(302, {location: "/ProblemeAvecDonne"});
                                            return res.end();
                                        }
                                        insertActivity(list, i + 1);
                                    });
                                } else {
                                    insertActivity(list, i + 1);
                                }
                            } else {
                                con.query("COMMIT", function (err, result) {
                                    if (err) {
                                        res.writeHead(302, {location: "/ProblemeAvecDonne"});
                                        return res.end();
                                    }
                                    con.end(function (err) {
                                        if (err) {
                                            return console.log('error:' + err.message);
                                        }
                                        res.writeHead(302, {location: "/ListeEquipement"});
                                        res.end();
                                    });
                                });
                            }
                        }

                        insertActivity(programmes, 0);
                    });
                });
            });
        });

    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page pour la liste d'etudiant
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/ListeEtudiant', (req, res) => {
    let sess = req.session;
    if (sess.permission === 3) {
        let con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            let sql1 = "SELECT NAETUDIANT,NOM, PRENOM, STATUS, NUMTELEPHONE, EMAIL, NAME FROM Etudiants INNER JOIN Programmes ON Etudiants.ProgramId=Programmes.IDPROGRAMME";

            if(req.query.recherche && req.query.identifiant){
                let value = req.query.identifiant;
                if(req.query.recherche.includes("LIKE")){
                    value = "'%" + value + "%'"
                }
                sql1 = sql1 + " WHERE "+ req.query.recherche + value
            }

            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                etudiants = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    return res.render("ListeEtudiant", {
                        title: "Liste Étudiant",
                        etudiants: etudiants
                    });
                });

                // end con1.end
            });

            // end con1.end

        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////// On envoit le professeur à une page différente car il a une nav bar différente
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (sess.permission === 2) {

        let con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            let sql1 = "SELECT NAETUDIANT,NOM, PRENOM, STATUS, NUMTELEPHONE, EMAIL, NAME FROM Etudiants INNER JOIN Programmes ON Etudiants.ProgramId=Programmes.IDPROGRAMME";
            if(req.query.recherche && req.query.identifiant){
                let value = req.query.identifiant;
                if(req.query.recherche.includes("LIKE")){
                    value = "'%" + value + "%'"
                }
                sql1 = sql1 + " WHERE "+ req.query.recherche + value
            }

            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                etudiants = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    console.log("huhuhuhuhuhu ")
                    return res.render("TeacherListeEtudiant", {
                        title: "Teacher Liste Étudiant",
                        etudiants: etudiants
                    })
                });

                // end con1.end
            });

            // end con1.end

        });

    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page pour qui recoit les demandes de la liste etudiant
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/etudiantChange', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    if (req.body.changement == 'delete' && sess.permission == 2) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var Dont = false;
            var sql = "DELETE FROM Etudiants WHERE NAETUDIANT = " + req.body.radioStudent + "";
            var sql1 = "SELECT * FROM EMPRUNT WHERE STUDENTID = " + req.body.radioStudent + "";
            con.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                result.forEach(ligne => {
                    if (ligne.STATUS > 1 && ligne.STATUS < 4) {
                        Dont = true;
                    }
                });
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                /////////// Ici on vérifie si l'étudiant à un emprunt actif avant de le supprimer 
                /////////// Si il en a un, seul un administrateur peu le supprimer
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                if (Dont) {
                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message)
                        }

                        res.writeHead(302, { location: "/DemandeNonFaite" });
                        return res.end();
                    });
                } else {
                    con.query(sql, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        con.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                            res.writeHead(302, { location: "/ListeEtudiant" });
                            res.end();
                        });
                    });
                }
            });
        });
    }
    if (req.body.changement == 'delete' && sess.permission == 3) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql = "DELETE FROM Etudiants WHERE NAETUDIANT = " + req.body.radioStudent + "";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/ListeEtudiant" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Confirmer') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql = "UPDATE Etudiants SET STATUS='Confirmé' WHERE NAETUDIANT = " + req.body.radioStudent + "";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/ListeEtudiant" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Modifier mot de passe') {
        sess.page2 = '<script> ';
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM Etudiants WHERE NAETUDIANT=?";

            con1.query(sql1, [req.body.radioStudent], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var etudiantMot = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }

                    etudiantMot.forEach(ligne => {
                        sess.page2 += ' personData(`' + ligne.NAETUDIANT + '`, 1,`' + ligne.NOM + '`,`' + ligne.PRENOM + '`); '
                    });
                    return res.render("ModificationMotDePasseAutre", {
                        user_id: etudiantMot[0].NAETUDIANT,
                        user_status: 1,
                        user: etudiantMot[0],
                        title: "Modification Mot De Passe Autre"
                    })
                });

                // end con1.end
            });

        });

    }
    if (req.body.changement == 'Modifier') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM Etudiants WHERE NAETUDIANT = " + req.body.radioStudent + "";
            var sql2 = "SELECT * FROM Programmes"

            con.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let etudiantChercher = result;
                con.query(sql2, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    let programmes = result;
                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        /////////// Ici on insère le donée de l'étudiant dans la page ainsi que la liste de programme, pour si on veut changer son programme
                        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        res.render("ModificationEtudiant", {
                            etudiant: etudiantChercher[0],
                            programmes: programmes,
                            title: "Modification Etudiant"
                        });
                    });
                });
            });
        });
    }

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page qui recoit les modifications sur un etudiant
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/modifyStudent', (req, res) => {
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        console.log("Connected");

        console.log("Autocommit off");
        var sql = "UPDATE Etudiants SET NOM =?, PRENOM =?, NUMTELEPHONE =?, EMAIL =?, PROGRAMID =? WHERE NAETUDIANT=?";


        con.query(sql, [req.body.nom, req.body.prenom, req.body.nTelephone, req.body.email, req.body.programmeChoisi, req.body.nAdmission], function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            con.end(function (err) {
                if (err) {
                    return console.log('error:' + err.message);
                }
                console.log('Database connection closed.');
                console.log(req.body.programmeAjouter + ' data saved');
                res.writeHead(302, { location: "/ListeEtudiant" });
                res.end();
            });


        });
    });


});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Enregistrement de changement de mot de passe fait par admin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/changerMotDePasseAutre', (req, res) => {
    var con = mysql.createConnection(dbConfig);

    if (req.body.Sorte == 1) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;
            console.log("Connected");

            var sql = "UPDATE Etudiants set PW = SHA2(?, 256) WHERE NAETUDIANT=? ";

            con.query(sql, [req.body.nouveau, req.body.ID], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/DataSaved" });
                    res.end();
                    console.log('Database connection closed.');
                });
            });
        });
    }
    if (req.body.Sorte == 2) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }


            var sql = "UPDATE Professeurs set PW = SHA2(?, 256) WHERE NPROFESSEUR=? ";

            con.query(sql, [req.body.nouveau, req.body.ID], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/DataSaved" });
                    res.end();
                    console.log('Database connection closed.');
                    console.log(req.body.nom + ' data saved');
                });
            });
        });
    }
    if (req.body.Sorte == 3) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }

            var sql = "UPDATE ADMIN set PW = SHA2(?, 256) WHERE NADMIN=? ";

            con.query(sql, [req.body.nouveau, req.body.ID], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/DataSaved" });
                    res.end();
                    console.log('Database connection closed.');
                    console.log(req.body.nom + ' data saved');
                });
            });
        });
    }

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page de la liste de professeurs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/ListeProfesseur', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM Professeurs";

            if(req.query.recherche && req.query.identifiant){
                let value = req.query.identifiant
                if(req.query.recherche.includes("LIKE")){
                    value = "'%"+value+"%'"
                }
                sql1 += " WHERE " + req.query.recherche + value
            }

            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let professeurs = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    return res.render("ListeProfesseur", {
                        title: "ListeProfesseur",
                        professeurs: professeurs
                    });
                });
            });
        });
    }

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code qui s'occupe des demandes de changements fait sur les professeurs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/professeurChange', (req, res) => {
    var con = mysql.createConnection(dbConfig);

    if (req.body.changement == 'delete') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }

            var sql = "DELETE FROM Professeurs WHERE NPROFESSEUR = " + req.body.radioProfesseur + "";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/ListeProfesseur" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Modifier mot de passe') {
        page2 = '<script> ';
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM Professeurs WHERE NPROFESSEUR=?";

            con1.query(sql1, [req.body.radioProfesseur], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var etudiantMot = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    return res.render("ModificationMotDePasseAutre", {
                        user_id: etudiantMot[0].NPROFESSEUR,
                        user_status: 2,
                        user: etudiantMot[0],
                        title: "Modification Mot De Passe Autre"
                    });
                });

                // end con1.end
            });

        });


    }
    if (req.body.changement == 'Confirmer') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql = "UPDATE Professeurs SET STATUS='Confirmé' WHERE NPROFESSEUR = " + req.body.radioProfesseur + "";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/ListeProfesseur" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Modifier') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }

            var sql1 = "SELECT * FROM Professeurs WHERE NPROFESSEUR = " + req.body.radioProfesseur + "";

            con.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let professeurs = result;

                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.render("ModificationProfesseur",{
                            professeur: professeurs[0],
                            title: "Modification Professeur"
                        }
                        );
                });
            });
        });

    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Enregistre les changements fait au professeurs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/modifyProfesseur', (req, res) => {
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        ;
        console.log("Connected");

        console.log("Autocommit off");
        var sql = "UPDATE Professeurs SET NOM ='" + req.body.nom + "', PRENOM ='" + req.body.prenom +
            "', EMAIL ='" + req.body.email + "' WHERE NPROFESSEUR ='" +
            req.body.nProfesseur + "'";


        con.query(sql, function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            ;
            con.end(function (err) {
                if (err) {
                    return console.log('error:' + err.message);
                }
                console.log('Database connection closed.');
                console.log(req.body.programmeAjouter + ' data saved');
                res.writeHead(302, { location: "/ListeProfesseur" });
                res.end();
            });


        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page de la liste admin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/ListeAdmin', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;
            console.log("Connected");
            var sql1 = "SELECT * FROM ADMIN";
            var sql2 = "SELECT * FROM Programmes";
            var sql3 = "SELECT * FROM TYPESDEQUIPEMENT";
            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                console.log(result);
                adminitrateurs = result;
                con1.query(sql3, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    ;
                    console.log(result);
                    typesEquipements = result;
                    con1.query(sql2, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        ;
                        console.log(result);
                        equipements = result;

                        con1.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                            console.log('Database connection closed.');
                            return res.render("ListeAdmin", {
                                title: "Liste Admin",
                                adminitrateurs: adminitrateurs
                            });
                        });

                        // end con1.end

                        // end con1.end

                    });

                });
            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code qui s'occupe des requests pour l'inscription d'un nouvel admin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/inscriptionadmin', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        return res.render("InscriptionAdmin", {
            title: "InscriptionAdmin",
        });
    }
});
app.post('/adData', (req, res) => {
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        ;
        con.query("SET AUTOCOMMIT = OFF", function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            ;
            var sql = "INSERT INTO ADMIN (NADMIN, NOM, PRENOM, EMAIL, PW)"
                + " VALUES (" + req.body.nAdmin + ", '" + req.body.nom + "', '" + req.body.prenom + "', '"
                + req.body.email + "',SHA2('" + req.body.motDePasse
                + "', 256) )";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                con.query("COMMIT", function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    ;
                    console.log('Commit done');
                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        console.log('Database connection closed.');
                        console.log(req.body.nom + ' data saved');
                        res.writeHead(302, { location: "/ListeAdmin" });
                        res.end();
                    });
                });


            });
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code qui s'occupe des requests pour la modification d'admin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/adminChange', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);

    if (req.body.changement == 'delete') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }

            var sql = "DELETE FROM ADMIN WHERE NADMIN = " + req.body.radioAdmin + "";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    res.writeHead(302, { location: "/ListeAdmin" });
                    res.end();
                });
            });

        });
    }
    if (req.body.changement == 'Modifier mot de passe') {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM ADMIN WHERE NADMIN=?";

            con1.query(sql1, [req.body.radioAdmin], function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var etudiantMot = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    return res.render("ModificationMotDePasseAutre", {
                        user_id: etudiantMot[0].NADMIN,
                        user_status: 3,
                        user: etudiantMot[0],
                        title: "Modification Mot De Passe Autre",
                    });
                });

                // end con1.end
            });

        });


    }

    if (req.body.changement == 'Modifier') {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }

            var sql1 = "SELECT * FROM ADMIN WHERE NADMIN = " + req.body.radioAdmin + "";

            con.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }

                con.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    return res.render("ModificationAdmin", {
                        admin: result[0],
                        title: "Modification Admin"
                    });
                });
            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Partie qui s'occupe d'enregistrer les modifications fait aux admin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/modifyAdmin', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        ;
        console.log("Connected");

        console.log("Autocommit off");
        var sql = "UPDATE ADMIN SET NOM ='" + req.body.nom + "', PRENOM ='" + req.body.prenom +
            "', EMAIL ='" + req.body.email + "' WHERE NADMIN ='" +
            req.body.nAdmin + "'";


        con.query(sql, function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            ;
            con.end(function (err) {
                if (err) {
                    return console.log('error:' + err.message);
                }
                console.log('Database connection closed.');
                console.log(req.body.programmeAjouter + ' data saved');
                res.writeHead(302, { location: "/ListeAdmin" });
                res.end();
            });
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// AjouterEquipement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/AjoutEquipement', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            console.log("Connected");
            var sql1 = "SELECT * FROM TYPESDEQUIPEMENT";
            var sql2 = "SELECT * FROM Programmes";
            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let typesEquipements = result;
                con1.query(sql2, function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    let programmes = result;
                    con1.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        /////////// Ici on insère les équipements par catégories
                        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


                        typesEquipements.forEach(ligne => {
                            sess.page2 += ' add_item_type("' + ligne.TYPEID + '", "' + ligne.TYPE + '"); '
                        });
                        programmes.forEach(ligne => {
                            sess.page2 += ' add_item_program("' + ligne.IDPROGRAMME + '", "' + ligne.NAME + '"); '
                        });
                        return res.render("AjouterEquipement", {
                            programmes: programmes,
                            typesEquipements: typesEquipements,
                            title: "AjoutEquipement"
                        });
                    });
                });
            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Recoit les informations sur les equipements ajouter
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/mtData', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {

        var con = mysql.createConnection(dbConfig);
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            con.query("SET AUTOCOMMIT = OFF", function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var sql = "INSERT INTO EQUIPEMENTS (DESCRIPTION, QUANTITE, TYPEID )"
                    + " VALUES (?,?,?)";
                con.query(sql, [req.body.Description, req.body.Quantite, req.body.TypeEquipement], function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    con.query("SELECT * FROM Programmes", function (err, programmes) {
                        function insertActivity(list, i) {
                            if (i < list.length) {
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                /////////// On insert dans cette fonctions tout les programmes d'un équipement
                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                                if (req.body["c_" + list[i].IDPROGRAMME]) {
                                    var sql = "INSERT INTO PROGRAMMEEQUIPEMENTS(EQUIPMENTID  , PROGRAMMEID) VALUES (LAST_INSERT_ID(), '" +
                                        list[i].IDPROGRAMME + "') ";
                                    con.query(sql, function (err, result) {
                                        if (err) {
                                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                                            return res.end();
                                        }
                                        insertActivity(list, i + 1);
                                    });
                                } else {
                                    insertActivity(list, i + 1);
                                }
                            } else {
                                con.query("COMMIT", function (err, result) {
                                    if (err) {
                                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                                        return res.end();
                                    }
                                    con.end(function (err) {
                                        if (err) {
                                            return console.log('error:' + err.message);
                                        }
                                        res.writeHead(302, { location: "/AjoutEquipement" });
                                        res.end();
                                    });
                                });
                            }
                        }

                        insertActivity(programmes, 0);
                    })

                });
            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// page de la liste de programme
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/ListeProgrammes', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            var sql1 = "SELECT * FROM Programmes";
            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                var programmes = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }

                    programmes.forEach(ligne => {
                        sess.page2 += ' add_programme("' + ligne.IDPROGRAMME + '","' + ligne.NAME + '"); '
                    });
                    return res.render("ListeProgrammes", {
                        programmes: programmes,
                        title: "ListeProgrammes"
                    });

                    // end con1.end
                });

            });
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// page qui rentre les donnees des programmes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/prData', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        var con = mysql.createConnection(dbConfig);
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;
            console.log("Connected");
            con.query("SET AUTOCOMMIT = OFF", function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;
                console.log("Autocommit off");
                var sql = "INSERT INTO Programmes (NAME)"
                    + " VALUES (?)";
                con.query(sql, [req.body.programmeAjouter], function (err, result) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    ;


                    con.query("COMMIT", function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        ;
                        console.log('Commit done');
                        con.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                            console.log('Database connection closed.');

                            console.log(req.body.Description + ' data saved');
                            res.writeHead(302, { location: "/ListeProgrammes" });
                            res.end();
                        });
                    });
                });
            });
        });
    }

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code pour supprimer un programme
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/SupprimerProgramme', (req, res) => {
    var con = mysql.createConnection(dbConfig);

    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        ;
        console.log(req.body.radioEmprunt);
        var sql1 = "DELETE FROM Programmes WHERE IDPROGRAMME = " + req.body.radioProgramme + "";

        con.query(sql1, function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            ;
            con.end(function (err) {
                if (err) {
                    return console.log('error:' + err.message);
                }
                console.log('Database connection closed.');
                console.log(req.body.radioProgramme + ' data saved');
                res.writeHead(302, { location: "/ListeProgrammes" });
                res.end();
            });
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// page pour ajouter un type d'objet
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/typeObjet', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        return res.render("AjouterClasseEquipement", {
            title: "Ajouter Type Equipement",
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code qui enregistre les nouveaux types d'equipements
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/clData', (req, res) => {
    var con = mysql.createConnection(dbConfig);
    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        ;
        console.log("Connected");
        con.query("SET AUTOCOMMIT = OFF", function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            ;
            console.log("Autocommit off");
            var sql = "INSERT INTO TYPESDEQUIPEMENT (TYPE)"
                + " VALUES (?)";
            con.query(sql, [req.body.programmeAjouter], function (err) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                con.query("COMMIT", function (err) {
                    if (err) {
                        res.writeHead(302, { location: "/ProblemeAvecDonne" });
                        return res.end();
                    }
                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        res.writeHead(302, { location: "/ListeType" });
                        res.end();
                    });
                });
            });
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////// Page de la liste de type d'equipement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/ListeType', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        var con1 = mysql.createConnection(dbConfig);
        con1.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            let sql1 = "SELECT * FROM TYPESDEQUIPEMENT";

            con1.query(sql1, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                let typesEquipements = result;
                con1.end(function (err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }
                    console.log('Database connection closed.');

                    return res.render("ListeType", {
                        typesEquipements: typesEquipements,
                        title: "Liste Type",
                    });
                });

                // end con1.end
            });

        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////// Code qui s'occupe de supprimer les types
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/SupprimerType', (req, res) => {
    var con = mysql.createConnection(dbConfig);

    con.connect(function (err) {
        if (err) {
            res.writeHead(302, { location: "/DataBaseConnectionFailed" });
            return res.end();
        }
        ;
        console.log(req.body.radioEmprunt);
        var sql1 = "DELETE FROM TYPESDEQUIPEMENT WHERE TYPEID = " + req.body.radioType + "";

        con.query(sql1, function (err, result) {
            if (err) {
                res.writeHead(302, { location: "/ProblemeAvecDonne" });
                return res.end();
            }
            ;
            con.end(function (err) {
                if (err) {
                    return console.log('error:' + err.message);
                }
                console.log('Database connection closed.');
                console.log(req.body.radioType + ' data saved');
                res.writeHead(302, { location: "/ListeType" });
                res.end();
            });
        });
    });


})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////// Page pour ajouter un programme
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/programme', (req, res) => {
    let sess = req.session;
    if (sess.permission == 3) {
        return res.render("AjouterProgramme", { title: "programme" });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Code Qui s'occupe des Déconnections
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/disconnect', (req, res) => {
    let sess = req.session;
    sess.username = null;
    sess.permission = null;
    res.writeHead(302, { location: "/" });
    res.end();
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page qui permet de changer son propre mot de passe
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/motDePasse', (req, res) => {
    let sess = req.session;
    if (sess.permission == 1) {
        return res.render("ModificationMotDePasseEtudiant", {
            title: "Modification Mot De Passe Étudiant"
        })
    }
    if (sess.permission == 2) {
        return res.render("TeacherModificationMotDePasse", {
            title: "Teacher Modification Mot De Passe"
        })
    }
    if (sess.permission == 3) {
        return res.render("ModificationMotDePasse", {
            title: "Modification Mot De Passe"
        })

    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Page pour recevoir les requetes de changements de mot de passe
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/changerMotDePasse', (req, res) => {
    let sess = req.session;
    var con = mysql.createConnection(dbConfig);

    if (sess.permission == 1) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;
            console.log("Connected");

            var sql = "SELECT * FROM Etudiants WHERE NAETUDIANT=" + sess.username + " && PW = SHA2('" + req.body.ancien
                + "', 256) ";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;


                if (result[0]) {
                    var sql = "UPDATE Etudiants SET PW = SHA2('" + req.body.nouveau
                        + "', 256) " + "WHERE NAETUDIANT=" + sess.username;
                    con.query(sql, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        ;
                        con.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                        });
                    });


                    res.writeHead(302, { location: "/DataSaved" });
                    res.end();
                } else {
                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                    });
                    res.writeHead(302, { location: "/DataNotSaved" });
                    res.end();
                }
                console.log('Database connection closed.');
                console.log(req.body.nom + ' data saved');

            });
        });


    }
    if (sess.permission == 2) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ;
            console.log("Connected");

            var sql = "SELECT * FROM Professeurs WHERE NPROFESSEUR=" + sess.username + " && PW = SHA2('" + req.body.ancien
                + "', 256) ";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;


                if (result[0]) {
                    var sql = "UPDATE Professeurs SET PW = SHA2('" + req.body.nouveau
                        + "', 256) " + "WHERE NPROFESSEUR=" + sess.username;
                    con.query(sql, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        ;
                        con.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                        });
                    });
                    console.log(req.body.nom + ' data saved');
                    res.writeHead(302, { location: "/DataSaved" });
                    res.end();

                } else {

                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }

                    });
                    res.writeHead(302, { location: "/DataNotSaved" });
                    res.end();
                }
                console.log('Database connection closed.');
                console.log(req.body.nom + ' data saved');

            });
        });


    }
    if (sess.permission == 3) {
        con.connect(function (err) {
            if (err) {
                res.writeHead(302, { location: "/DataBaseConnectionFailed" });
                return res.end();
            }
            ; r;
            console.log("Connected");

            var sql = "SELECT * FROM ADMIN WHERE NADMIN=" + sess.username + " && PW = SHA2('" + req.body.ancien
                + "', 256) ";

            con.query(sql, function (err, result) {
                if (err) {
                    res.writeHead(302, { location: "/ProblemeAvecDonne" });
                    return res.end();
                }
                ;


                if (result[0]) {
                    var sql = "UPDATE ADMIN SET PW = SHA2('" + req.body.nouveau
                        + "', 256) " + "WHERE NADMIN=" + sess.username;
                    con.query(sql, function (err, result) {
                        if (err) {
                            res.writeHead(302, { location: "/ProblemeAvecDonne" });
                            return res.end();
                        }
                        ;
                        con.end(function (err) {
                            if (err) {
                                return console.log('error:' + err.message);
                            }
                        });
                    });
                    res.writeHead(302, { location: "/DataSaved" });
                    res.end();
                } else {
                    con.end(function (err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                    });
                    res.writeHead(302, { location: "/DataNotSaved" });
                    res.end();
                }
                console.log('Database connection closed.');
                console.log(req.body.nom + ' data saved');

            });
        });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Pages disant que l'operation a ete effectuer avec, ou sans succes pour les mots de passes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/DataSaved', (req, res) => {
    return res.render("DataSaved", {title: "Data Saved"});
});
app.get('/DataNotSaved', (req, res) => {
    return res.render("DataNotSaved", {title: "Data not Saved"});
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Pages d'erreurs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/DataBaseConnectionFailed', (req, res) => {
    return res.render("ConnectionNonReussis", {title: "Connection Non Reussis"});
});
app.get('/ProblemeAvecDonne', (req, res) => {
    return res.render("ProblemeAvecDonne", {title: "probleme avec la bd"});
});
app.get('/DemandeNonFaite', (req, res) => {
    return res.render("DemandeNonFaite", {title: "Demande Non Faite"});
});

app.listen(process.env.PORT || 4050, () => {
    console.log(`App Started on PORT ${process.env.PORT || 4050}`);
})
describe("router cfg", () => {

    beforeEach(() => {
        jasmine.addMatchers({
            toOutput: () => {
                return {
                    compare: (actual, expected) => {
                        let actualLines = actual.trim().split("\n");
                        let expectedLines = expected.trim().split("\n");
                        if (expectedLines.length !== actualLines.length) {
                            return {
                                pass: false,
                                message: `expected ${expectedLines.length} lines, got ${actualLines.length}`
                            }
                        }
                        for (let lineNo in expectedLines) {
                            let expLine = expectedLines[lineNo].trim();
                            let actLine = actualLines[lineNo].trim();
                            if (expLine.trim() !== actLine.trim()) {
                                return {
                                    pass: false,
                                    message: `line ${lineNo}: expected ${expLine}, but was: ${actLine}`
                                };
                            }
                        }
                        return {
                            pass: true
                        }
                    }
                }
            }
        })
    })

    function expectError(input, vars, expectedError) {
        try {
            main(input, vars);
            fail("did not throw error")
        } catch (e) {
            expect(e.toString()).toEqual(expectedError);
        }
    }

    describe("basic echo", () => {
        it("ignores lines with exclamation marks", () => {
            let actual = main(`!
            line
            !`, ``);
            expect(actual).toOutput("line");
        })

        it("joins lines ending with \\", () => {
            let actual = main(`line 1
            line 2 part 1 \\
            line 2 part 2 \\
            line 2 part 3
            line 3`, ``)

            expect(actual).toOutput(`line 1
            line 2 part 1 line 2 part 2 line 2 part 3
            line 3`);
        })

        it("writes no-operation line", () => {
            let actual = main(`
                print this
                and this`, ``)
            expect(actual).toOutput(`print this
            and this`)
        })
    })

    describe("variable substitution and symbol table parsing", () => {
        it("substitutes variables", () => {
            let actual = main(`first <FIRST_VAR> <SECOND_VAR>
            second <SECOND_VAR>`,
                `FIRST_VAR = 1
            SECOND_VAR = two`)
            expect(actual).toOutput(`first 1 two
            second two`);
        })

        it("prints error on undefined variable", () => {
            expectError(`first <var>`, ``, "undefined variable var found at line 0")
        });

        it("prints error on substituting list-type variable", () => {
            expectError(`<listvar>`, `listvar = a,b,c`, "cannot print list listvar")
        })

        it("prints error on substituting dict-type variable", () => {
            expectError(`<dictvar>`, `dictvar = a:1,b:2,c:3`, "cannot print dictionary dictvar")
        })

        it("prints error on duplicate variable", () => {
            expectError(``, `first=1
            second=a,b,c
            first=3`, "duplicate variable definition: first")
        });

        it("prints error on ambiguous var type", () => {
            expectError(``, `ambigvar=a:1,b`, "ambiguous variable ambigvar: cannot determine if it is a list or dictionary")
            expectError(``, `ambigvar=a,b:1`, "ambiguous variable ambigvar: cannot determine if it is a list or dictionary")
        })
    })

    describe("conditionals", () => {

        describe("endif", () => {

            it("works without spaces", () => {
                programLines = ["#endif"];
                lineNo = 0;
                expect(currentLineIsEndIf()).toBe(true)
            })

            it("works with spaces", () => {
                programLines = ["#  endif"];
                lineNo = 0;
                expect(currentLineIsEndIf()).toBe(true)
            })

        })

        it("if evaluates to true", () => {
            let actual = main(`
            before
            #if <tru>
            line 1
            # endif
            after`, `tru=true`)
            expect(actual).toOutput(
                `before
                line 1
                after`)
        })

        it("if evaluates to true, has unless", () => {
            let actual = main(`
            before
            #if <tru>
            line 1
            #unless
            unless-line
            # endif
            after`, `tru=true`)
            expect(actual).toOutput(
                `before
                line 1
                after`)
        })

        it("if evaluates to false", () => {
            let actual = main(`
            before
            #if <fls>
            line 1
            # endif
            after`, `fls=false`)
            expect(actual).toOutput(
                `before
                after`)
        })

        it("if evaluates to false, has unless", () => {
            let actual = main(`
            before
            #if <fls>
            line 1
            #unless
            unless-line
            # endif
            after`, `fls=false`)
            expect(actual).toOutput(
                `before
                unless-line
                after`)
        })

        it("handles nested ifs", () => {
            let actual = main(`
                before
                #if <tru>
                # if <fls>
                    not-printed
                #unless
                    unless
                #endif
                #unless
                    not-printed
                #endif
                after
            
            `,
                `tru=true
            fls=false`);
            expect(actual).toOutput(`before
            unless
            after`)
        })

        it("misses closing endif", () => {

        })

    })

    describe("foreach", () => {

        it("runs foreach on scalar as 1-elem list", () => {
            let actual = main(`before
            #foreach <param> in <var>
            repeated-line <param> <var>
            #endfor`,
                `
            var=2
            `);
            expect(actual).toOutput(`
            before
            repeated-line 2 2
            `)
        })

        it("runs foreach on list with 1 param", () => {
            let actual = main(`
                before
                #foreach <param> in <mylist>
                repeated-line <param> <var>
                #endfor
            `,
                `mylist=a,b,ccc
            var=12`)
            expect(actual).toOutput(`
                before
                repeated-line a 12
                repeated-line b 12
                repeated-line ccc 12
            `)
        })

        it("runs foreach on list with 2 params", () => {
            let actual = main(`
                before
                #foreach <idx>,<val> in <mylist>
                repeated-line #<idx>: <val>
                #endfor
            `, `mylist=a,b,cc`)

            expect(actual).toOutput(`
            before
            repeated-line #0: a
            repeated-line #1: b
            repeated-line #2: cc
            `)
        })

        it("runs foreach on dictionary with 1 param", () => {
            let actual = main(`
            before
            #foreach <param> in <mydict>
            repeated-line <param> <var>
            #endfor
        `,
                `mydict=x:a,y:b,z:ccc
                var=12`)
            expect(actual).toOutput(`
            before
            repeated-line a 12
            repeated-line b 12
            repeated-line ccc 12
        `)
        })

        it("runs foreach on dictionary with 2 params", () => {
            let actual = main(`
            before
            #foreach <idx>,<val> in <mylist>
            repeated-line #<idx>: <val>
            #endfor
        `, `mylist=k0:a,k1:b,k2:cc`)

            expect(actual).toOutput(`
        before
        repeated-line #k0: a
        repeated-line #k1: b
        repeated-line #k2: cc
        `)
        })

    })

    describe("define", () => {

        it("define sets value to true", () => {
            let actual = main(`
                before
                #define myvar
                line <myvar>
            `, ``)
            expect(actual).toOutput(`
            before
            line true`)
        })

        it("define sets value to specified value", () => {
            let actual = main(`
            #define a=22
            line <a>`, ``);

            expect(actual).toOutput(`line 22`)
        })

        xit("prints warning on already defined variable", () => {

        })

        it("ifdef recognizes undefined value as false", () => {
            let actual = main(`
            #ifdef myvar
            line    
            #endif
            `, ``)
            expect(actual).toOutput("")
        })

        it("ifdef recognizes defined value", () => {
            let actual = main(`
            #ifdef myvar
            line    
            #endif
            `, `myvar=true`)
            expect(actual).toOutput("line")
        })

        it("define parses 'false' as false", () => {
            let actual = main(`
            #define myvar=false
            #if <myvar>
            line    
            #endif
            `, ``)
            expect(actual).toOutput("")
        })

    });

})